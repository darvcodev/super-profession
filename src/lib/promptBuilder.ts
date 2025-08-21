import type { ProfessionConfig } from "../types";

// Configuración de profesiones con sus escenarios épicos orientados a roles de empresa
export const PROFESSION_CONFIGS: ProfessionConfig[] = [
  {
    value: "Líder de Proyectos",
    label: "Líder de Proyectos",
    scenario:
      "orquestando un equipo de hologramas, diagramas de Gantt flotantes, en un centro de comando futurista",
  },
  {
    value: "Especialista en Marketing",
    label: "Especialista en Marketing",
    scenario:
      "creando campañas de luz, con gráficos virales y vallas publicitarias holográficas en una ciber-ciudad",
  },
  {
    value: "Analista de Datos",
    label: "Analista de Datos",
    scenario:
      "navegando por un mar tridimensional de datos, con insights luminosos y dashboards holográficos",
  },
  {
    value: "Desarrollador de Software",
    label: "Desarrollador de Software",
    scenario:
      "escribiendo código que se materializa como estructuras de neón, en un entorno de realidad virtual",
  },
  {
    value: "Diseñador UX/UI",
    label: "Diseñador UX/UI",
    scenario:
      "moldeando interfaces de usuario fluidas en el aire, con paletas de colores flotantes y prototipos interactivos",
  },
  {
    value: "Recursos Humanos",
    label: "Recursos Humanos",
    scenario:
      "conectando redes neuronales de talento, en un jardín zen corporativo con árboles de datos",
  },
  {
    value: "Finanzas y Contabilidad",
    label: "Finanzas y Contabilidad",
    scenario:
      "protegiendo una bóveda de datos financieros con escudos de energía, rodeado de gráficos dorados ascendentes",
  },
  {
    value: "Soporte Técnico",
    label: "Soporte Técnico",
    scenario:
      "reparando un núcleo de servidor con herramientas de luz, en una sala de servidores de alta tecnología",
  },
  {
    value: "Ventas y Comercial",
    label: "Ventas y Comercial",
    scenario:
      "cerrando un trato con un apretón de manos de energía, sobre un mapa holográfico de la ciudad",
  },
  {
    value: "Personalizada",
    label: "Personalizada",
    scenario:
      "entorno épico y majestuoso, elementos únicos de poder, iluminación dramática",
  },
];

/**
 * Obtiene la configuración de una profesión
 */
export function getProfessionConfig(profession: string): ProfessionConfig {
  const config = PROFESSION_CONFIGS.find((p) => p.value === profession);
  if (!config || config.value === "Personalizada") {
    // Para profesiones personalizadas, usar un escenario genérico pero potente
    return {
      value: profession,
      label: profession,
      scenario:
        "entorno majestuoso y poderoso, elementos únicos de grandeza, iluminación épica cinematográfica",
    };
  }
  return config;
}

/**
 * Construye el prompt para generación de imagen según las especificaciones del PROMPT.md
 */
export function buildImagePrompt(name: string, profession: string): string {
  const config = getProfessionConfig(profession);

  const basePrompt = `Portrait of ${name} as an epic superhero version of a ${profession}, ultra-detailed, dramatic lighting, cinematic, award-winning photography, hero pose, dynamic composition, majestic environment: ${config.scenario}, realistic face identical to the input photo, sharp focus, 8k, masterpiece.`;

  return basePrompt;
}

/**
 * Construye el negative prompt para mejorar la calidad
 */
export function buildNegativePrompt(): string {
  return "deformed face, disfigured, extra limbs, duplicate, low-res, blurry, bad anatomy, worst quality, low quality, normal quality, lowres, pixelated, ugly, distorted, watermark";
}

/**
 * Construye el prompt para generación de texto motivacional en español
 */
export function buildTextPrompt(name: string, profession: string): string {
  return `Tono épico, motivacional, inclusivo. Devuelve 2–3 líneas (25–60 palabras). Incluye el nombre y la profesión, destacando su aporte y que "esa profesión vale" en la empresa. Sin emojis, sin comillas, sin prefijos. Datos: nombre=${name}, profesión=${profession}.`;
}

/**
 * Genera parámetros recomendados para la API de imagen
 */
export function getImageGenerationParams() {
  return {
    size: "1024x1024",
    cfg_scale: 7,
    denoising_strength: 0.3, // Conservación de identidad facial
    sampler: "k_euler_a",
    steps: 30,
    style_preset: "cinematic",
  };
}

/**
 * Valida que los parámetros de entrada sean correctos
 */
export function validatePromptParams(
  name: string,
  profession: string
): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return {
      valid: false,
      error: "El nombre debe tener al menos 2 caracteres.",
    };
  }

  if (name.length > 60) {
    return {
      valid: false,
      error: "El nombre no puede tener más de 60 caracteres.",
    };
  }

  if (!profession || profession.trim().length === 0) {
    return {
      valid: false,
      error: "Debes seleccionar una profesión.",
    };
  }

  return { valid: true };
}

/**
 * Construye un mensaje de WhatsApp formateado
 */
export function buildWhatsAppMessage(
  name: string,
  profession: string,
  description: string,
  imageUrl: string
): string {
  const message = [
    "Mira mi postal épica ✨",
    `Nombre: ${name}`,
    `Profesión: ${profession}`,
    description,
    imageUrl,
  ].join("\n\n");

  return message;
}
