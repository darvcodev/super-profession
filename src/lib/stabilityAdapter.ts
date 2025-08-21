import type { GenParams, GenResult } from "../types";
import { BaseGenerator } from "./generation";
import {
  buildImagePrompt,
  buildNegativePrompt,
  getImageGenerationParams,
} from "./promptBuilder";

/**
 * Adaptador para Stability AI API (Stable Diffusion para imagen-a-imagen)
 */
export class StabilityAdapter extends BaseGenerator {
  private readonly imageEndpoint: string;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    const base = baseUrl || "https://api.stability.ai/v1";
    this.imageEndpoint = `${base}/generation/stable-diffusion-xl-1024-v1-0/image-to-image`;
  }

  async generate(payload: GenParams): Promise<GenResult> {
    this.validateApiKey();

    try {
      // Generar imagen con Stability y texto con LLM
      const [imageResult, textResult] = await Promise.all([
        this.generateImage(payload),
        this.generateText(payload),
      ]);

      return {
        imageUrl: imageResult,
        description: textResult,
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Genera imagen épica usando Stable Diffusion image-to-image
   */
  private async generateImageToImage(payload: GenParams): Promise<string> {
    const prompt = buildImagePrompt(payload.name, payload.profession);
    const negativePrompt = buildNegativePrompt();
    const params = getImageGenerationParams();

    // Preparar FormData para Stability AI
    const formData = new FormData();
    formData.append("init_image", payload.userImage);
    formData.append("init_image_mode", "IMAGE_STRENGTH");
    formData.append("image_strength", "0.85"); // Aumentado para conservar más rasgos faciales
    formData.append("text_prompts[0][text]", prompt);
    formData.append("text_prompts[0][weight]", "1");
    formData.append("text_prompts[1][text]", negativePrompt);
    formData.append("text_prompts[1][weight]", "-1");
    formData.append("cfg_scale", params.cfg_scale.toString());
    formData.append("samples", "1");
    formData.append("steps", params.steps.toString());
    formData.append("style_preset", params.style_preset);

    const response = await fetch(this.imageEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.artifacts || !data.artifacts[0]) {
      throw new Error("Respuesta inválida de Stability AI");
    }

    // Stability devuelve la imagen en base64
    const base64Image = data.artifacts[0].base64;
    return `data:image/png;base64,${base64Image}`;
  }

  /**
   * Genera imagen usando text-to-image como fallback
   */
  private async generateTextToImage(payload: GenParams): Promise<string> {
    const prompt = buildImagePrompt(payload.name, payload.profession);
    const negativePrompt = buildNegativePrompt();
    const params = getImageGenerationParams();

    const textToImageEndpoint = this.imageEndpoint.replace(
      "image-to-image",
      "text-to-image"
    );

    const requestBody = {
      text_prompts: [
        {
          text: prompt,
          weight: 1,
        },
        {
          text: negativePrompt,
          weight: -1,
        },
      ],
      cfg_scale: params.cfg_scale,
      height: 1024,
      width: 1024,
      samples: 1,
      steps: params.steps,
      style_preset: params.style_preset,
    };

    const response = await fetch(textToImageEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.artifacts || !data.artifacts[0]) {
      throw new Error("Respuesta inválida de Stability AI");
    }

    const base64Image = data.artifacts[0].base64;
    return `data:image/png;base64,${base64Image}`;
  }

  /**
   * Genera imagen con manejo de fallback
   */
  private async generateImage(payload: GenParams): Promise<string> {
    try {
      // Intentar primero image-to-image para conservar características faciales
      return await this.generateImageToImage(payload);
    } catch (error) {
      console.warn(
        "Image-to-image falló, usando text-to-image como fallback:",
        error
      );
      // Fallback a text-to-image
      return await this.generateTextToImage(payload);
    }
  }

  /**
   * Genera texto motivacional (usando un LLM externo por ahora)
   * En producción, podrías usar otro proveedor como Anthropic, Cohere, etc.
   */
  private async generateText(payload: GenParams): Promise<string> {
    // Para esta implementación, usaremos una respuesta generada localmente
    // En producción, integrarías con otro LLM
    return this.generateLocalText(payload);
  }

  /**
   * Genera texto usando patrones locales como fallback
   */
  private generateLocalText(payload: GenParams): string {
    const templates = [
      `${payload.name} es un/a ${payload.profession} excepcional que transforma cada proyecto en una obra maestra. Su dedicación y talento son la base del éxito de nuestro equipo.`,

      `En ${payload.name} encontramos la perfecta fusión de pasión y expertise como ${payload.profession}. Su trabajo marca la diferencia y demuestra por qué esta profesión vale tanto.`,

      `${payload.name} representa la excelencia en ${payload.profession}. Cada día demuestra que su compromiso y visión son fundamentales para alcanzar nuevas alturas en la empresa.`,

      `La contribución de ${payload.name} como ${payload.profession} es invaluable. Su liderazgo y dedicación inspiran a todo el equipo hacia la innovación y el crecimiento.`,

      `${payload.name} embodies excellence as ${payload.profession}. Su enfoque único y determinación convierten cada desafío en una oportunidad de brillar.`,
    ];

    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];
    return randomTemplate;
  }
}

/**
 * Stub/Mock del adaptador de Stability para desarrollo
 * Útil cuando no tienes API key de Stability disponible
 */
export class StabilityMockAdapter extends BaseGenerator {
  async generate(payload: GenParams): Promise<GenResult> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockDescriptions = [
      `${payload.name} es un/a ${payload.profession} excepcional que ilumina cada proyecto con su brillante expertise. Su dedicación transforma desafíos en victorias épicas para toda la empresa.`,

      `En ${payload.name} confluyen el talento y la pasión de un/a ${payload.profession} legendario/a. Su trabajo no solo cumple expectativas, las supera creando un legado de excelencia.`,

      `${payload.name} demuestra día a día por qué ${payload.profession} es una profesión que vale oro puro. Su compromiso y visión estratégica elevan a todo el equipo hacia la grandeza.`,
    ];

    const randomDescription =
      mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];

    // Imagen placeholder con tema épico
    const epicPlaceholder = `https://picsum.photos/1024/1024?random=${Date.now()}&blur=1`;

    return {
      imageUrl: epicPlaceholder,
      description: randomDescription,
    };
  }
}
