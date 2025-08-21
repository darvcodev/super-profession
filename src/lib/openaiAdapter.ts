import type { GenParams, GenResult } from "../types";
import { BaseGenerator } from "./generation";
import { buildImagePrompt, buildTextPrompt } from "./promptBuilder";

/**
 * Adaptador para OpenAI API (DALL-E 3 para imágenes + GPT para texto)
 */
export class OpenAIAdapter extends BaseGenerator {
  private readonly imageEndpoint: string;
  private readonly textEndpoint: string;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    const base = baseUrl || "https://api.openai.com/v1";
    this.imageEndpoint = `${base}/images/generations`;
    this.textEndpoint = `${base}/chat/completions`;
  }

  async generate(payload: GenParams): Promise<GenResult> {
    this.validateApiKey();

    try {
      // Generar imagen y texto en paralelo para mejor rendimiento
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
   * Genera imagen épica usando DALL-E 3
   */
  private async generateImage(payload: GenParams): Promise<string> {
    const prompt = buildImagePrompt(payload.name, payload.profession);

    // Para DALL-E 3, no podemos usar image-to-image directamente
    // Pero podemos incluir una descripción más detallada del rostro
    const enhancedPrompt = `${prompt} The person should have the exact facial features from the reference photo provided.`;

    const requestBody = {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    };

    const response = await fetch(this.imageEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response || !response.ok) {
      const error = await response?.json().catch(() => ({}));
      throw new Error(
        error?.error?.message ||
          `HTTP ${response?.status || "unknown"}: ${
            response?.statusText || "Unknown error"
          }`
      );
    }

    const data = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("Respuesta inválida de la API de imagen");
    }

    return data.data[0].url;
  }

  /**
   * Genera texto motivacional usando GPT
   */
  private async generateText(payload: GenParams): Promise<string> {
    const prompt = buildTextPrompt(payload.name, payload.profession);

    const requestBody = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en copywriting motivacional e inclusivo. Generas textos épicos que destacan el valor de cada profesión en las empresas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    };

    const response = await fetch(this.textEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response || !response.ok) {
      const error = await response?.json().catch(() => ({}));
      throw new Error(
        error?.error?.message ||
          `HTTP ${response?.status || "unknown"}: ${
            response?.statusText || "Unknown error"
          }`
      );
    }

    const data = await response.json();

    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message?.content
    ) {
      throw new Error("Respuesta inválida de la API de texto");
    }

    return data.choices[0].message.content.trim();
  }
}

/**
 * Versión experimental con edición de imagen (requiere una imagen base)
 * Nota: OpenAI deprecó el endpoint de ediciones, por lo que esta implementación
 * usa un enfoque alternativo con inpainting o variaciones
 */
export class OpenAIImageEditAdapter extends BaseGenerator {
  private readonly editEndpoint: string;
  private readonly textEndpoint: string;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    const base = baseUrl || "https://api.openai.com/v1";
    this.editEndpoint = `${base}/images/variations`;
    this.textEndpoint = `${base}/chat/completions`;
  }

  async generate(payload: GenParams): Promise<GenResult> {
    this.validateApiKey();

    try {
      // Generar imagen usando variaciones de la imagen del usuario
      const [imageResult, textResult] = await Promise.all([
        this.generateImageVariation(payload),
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
   * Genera variación épica de la imagen del usuario
   */
  private async generateImageVariation(payload: GenParams): Promise<string> {
    // Nota: La conversión a base64 se maneja en el FormData automáticamente

    // Crear FormData para el envío
    const formData = new FormData();
    formData.append("image", payload.userImage);
    formData.append("n", "1");
    formData.append("size", "1024x1024");

    const response = await fetch(this.editEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("Respuesta inválida de la API de imagen");
    }

    return data.data[0].url;
  }

  /**
   * Genera texto motivacional (mismo que en OpenAIAdapter)
   */
  private async generateText(payload: GenParams): Promise<string> {
    const prompt = buildTextPrompt(payload.name, payload.profession);

    const requestBody = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en copywriting motivacional e inclusivo. Generas textos épicos que destacan el valor de cada profesión en las empresas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    };

    const response = await fetch(this.textEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message?.content
    ) {
      throw new Error("Respuesta inválida de la API de texto");
    }

    return data.choices[0].message.content.trim();
  }
}
