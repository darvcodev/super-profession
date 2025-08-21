import type { GenParams, GenResult, ImageTextGenerator } from "../types";

/**
 * Interfaz común para todos los adaptadores de generación de IA
 */
export abstract class BaseGenerator implements ImageTextGenerator {
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract generate(payload: GenParams): Promise<GenResult>;

  /**
   * Maneja errores comunes de API
   */
  protected handleApiError(error: any): never {
    console.error("Error en generación:", error);

    if (error.response?.status === 401) {
      throw new Error("API key inválida o expirada");
    }

    if (error.response?.status === 429) {
      throw new Error(
        "Límite de rate alcanzado. Intenta de nuevo en unos minutos"
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Error del servidor. Intenta de nuevo más tarde");
    }

    if (error.message?.includes("network") || error.code === "NETWORK_ERROR") {
      throw new Error("Error de conexión. Verifica tu internet");
    }

    throw new Error(error.message || "Error desconocido en la generación");
  }

  /**
   * Valida que la API key esté configurada
   */
  protected validateApiKey(): void {
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error("API key no configurada");
    }
  }
}

/**
 * Factory para crear generadores según el proveedor
 */
export class GeneratorFactory {
  static async create(
    provider: "openai" | "stability",
    apiKey: string,
    baseUrl?: string
  ): Promise<ImageTextGenerator> {
    switch (provider) {
      case "openai":
        try {
          const { OpenAIAdapter } = await import("./openaiAdapter");
          return new OpenAIAdapter(apiKey, baseUrl);
        } catch (error) {
          console.warn("OpenAI adapter not available, using mock generator");
          return new MockGenerator(apiKey);
        }

      case "stability":
        try {
          const { StabilityAdapter } = await import("./stabilityAdapter");
          return new StabilityAdapter(apiKey, baseUrl);
        } catch (error) {
          console.warn("Stability adapter not available, using mock generator");
          return new MockGenerator(apiKey);
        }

      default:
        throw new Error(`Proveedor no soportado: ${provider}`);
    }
  }
}

/**
 * Configuración por defecto para modo demo/desarrollo
 */
export class MockGenerator extends BaseGenerator {
  async generate(payload: GenParams): Promise<GenResult> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockDescriptions = [
      `${payload.name} es un/a ${payload.profession} excepcional que transforma cada desafío en una oportunidad brillante. Su dedicación y pasión inspiran a todo el equipo hacia la excelencia.`,
      `En ${payload.name} encontramos la perfecta combinación de talento y determinación. Como ${payload.profession}, su trabajo marca la diferencia y eleva los estándares de calidad en cada proyecto.`,
      `${payload.name} demuestra día a día por qué ${payload.profession} es una profesión que vale oro. Su compromiso y expertise son fundamentales para el éxito de nuestra empresa.`,
    ];

    const randomDescription =
      mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];

    // Imagen placeholder épica
    const placeholderImage = `https://picsum.photos/1024/1024?random=${Date.now()}`;

    return {
      imageUrl: placeholderImage,
      description: randomDescription,
    };
  }
}
