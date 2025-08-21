import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GenParams,
  GenResult,
  ImageTextGenerator,
  ApiProvider,
} from "../types";
import { GeneratorFactory, MockGenerator } from "../lib/generation";

// Configuración del hook
interface UseGenerateEpicOptions {
  provider?: ApiProvider;
  apiKey?: string;
  baseUrl?: string;
  onSuccess?: (data: GenResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para manejar la generación de postales épicas con IA
 * Usa TanStack Query para manejar estados de loading, error y retry
 */
export function useGenerateEpic(options: UseGenerateEpicOptions = {}) {
  const queryClient = useQueryClient();

  const { provider = "openai", apiKey, baseUrl, onSuccess, onError } = options;

  /**
   * Crea el generador apropiado según la configuración
   */
  const createGenerator = async (): Promise<ImageTextGenerator> => {
    // Si no hay API key, usar mock para desarrollo
    if (!apiKey || apiKey.trim() === "") {
      console.warn("No API key provided, using mock generator for development");
      return new MockGenerator("mock-key");
    }

    try {
      return await GeneratorFactory.create(provider, apiKey, baseUrl);
    } catch (error) {
      console.error("Error creating generator:", error);
      return new MockGenerator("fallback-key");
    }
  };

  /**
   * Mutación principal para generar postal épica
   */
  const mutation = useMutation({
    mutationFn: async (params: GenParams): Promise<GenResult> => {
      const generator = await createGenerator();
      return await generator.generate(params);
    },

    // Configuración de retry con backoff exponencial
    retry: (failureCount, error) => {
      // No reintentar si es error de API key o auth
      if (error.message.includes("API key") || error.message.includes("401")) {
        return false;
      }

      // Reintentar hasta 3 veces para otros errores
      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    onSuccess: (data) => {
      // Invalidar cache relacionado si es necesario
      queryClient.invalidateQueries({ queryKey: ["epic-generations"] });
      onSuccess?.(data);
    },

    onError: (error) => {
      console.error("Error generating epic postcard:", error);
      onError?.(error as Error);
    },
  });

  return {
    // Función para generar postal épica
    generateEpic: mutation.mutate,
    generateEpicAsync: mutation.mutateAsync,

    // Estados de la mutación
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,

    // Datos y error
    data: mutation.data,
    error: mutation.error,

    // Funciones de control
    reset: mutation.reset,

    // Estado de retry
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,
  };
}

/**
 * Hook específico para usar con OpenAI
 */
export function useOpenAIGeneration(
  apiKey: string,
  options?: Omit<UseGenerateEpicOptions, "provider" | "apiKey">
) {
  return useGenerateEpic({
    ...options,
    provider: "openai",
    apiKey,
  });
}

/**
 * Hook específico para usar con Stability AI
 */
export function useStabilityGeneration(
  apiKey: string,
  options?: Omit<UseGenerateEpicOptions, "provider" | "apiKey">
) {
  return useGenerateEpic({
    ...options,
    provider: "stability",
    apiKey,
  });
}

/**
 * Hook para modo demo/desarrollo (sin API keys)
 */
export function useMockGeneration(
  options?: Omit<UseGenerateEpicOptions, "provider" | "apiKey">
) {
  return useGenerateEpic({
    ...options,
    provider: "openai", // No importa, usará mock
    apiKey: undefined,
  });
}

/**
 * Tipo para el resultado del hook
 */
export type UseGenerateEpicResult = ReturnType<typeof useGenerateEpic>;

/**
 * Utilidad para crear configuración de React Query Provider
 */
export const epicGenerationQueryKeys = {
  all: ["epic-generations"] as const,
  byUser: (userId: string) => [...epicGenerationQueryKeys.all, userId] as const,
  byDate: (date: string) =>
    [...epicGenerationQueryKeys.all, "date", date] as const,
} as const;
