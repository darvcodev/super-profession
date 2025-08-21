import type { ProfessionConfig } from "../types";

// Configuración de profesiones con sus escenarios épicos según el PROMPT.md
export const PROFESSION_CONFIGS: ProfessionConfig[] = [
  {
    value: "Ingenier@",
    label: "Ingenier@",
    scenario:
      "exoesqueleto tecnológico, hologramas de circuitos, skyline futurista nocturno, iluminación dramática",
  },
  {
    value: "Abogad@",
    label: "Abogad@",
    scenario:
      "capa elegante, balanza de la justicia luminosa, juzgado monumental, columnas clásicas",
  },
  {
    value: "Médic@",
    label: "Médic@",
    scenario:
      "armadura sanitaria luminosa, nanobots de luz, hospital de vanguardia de fondo",
  },
  {
    value: "Docente",
    label: "Docente",
    scenario:
      "toga de sabio, constelaciones de fórmulas, biblioteca infinita resplandeciente",
  },
  {
    value: "Chef",
    label: "Chef",
    scenario:
      "chaqueta épica, torbellino de especias, cocina palaciega ardiente",
  },
  {
    value: "Arquitect@",
    label: "Arquitect@",
    scenario:
      "planos flotantes, rascacielos en construcción, luz cenital cinematográfica",
  },
  {
    value: "Diseñador/a",
    label: "Diseñador/a",
    scenario:
      "pinceladas de luz, tipografías flotantes, estudio creativo futurista",
  },
  {
    value: "Emprendedor/a",
    label: "Emprendedor/a",
    scenario:
      "gráficos ascendentes holográficos, ciudad brillante, energía dinámica",
  },
  {
    value: "Músic@",
    label: "Músic@",
    scenario: "ondas sonoras visibles, escenario gigantesco, focos teatrales",
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
  if (!config) {
    // Para profesiones personalizadas, crear un escenario genérico
    return {
      value: profession,
      label: profession,
      scenario: deduceCustomProfessionScenario(profession),
    };
  }
  return config;
}

/**
 * Deduce un escenario épico para una profesión personalizada
 */
function deduceCustomProfessionScenario(profession: string): string {
  const lowerProf = profession.toLowerCase();

  // Mapeos basados en palabras clave
  const scenarioMappings = [
    {
      keywords: ["artista", "pintor", "escultor", "arte"],
      scenario:
        "estudio artístico resplandeciente, paleta de colores flotante, obras maestras de fondo",
    },
    {
      keywords: ["programador", "developer", "código", "software"],
      scenario:
        "matriz de código digital, servidores luminosos, realidad virtual futurista",
    },
    {
      keywords: ["escritor", "autor", "periodista", "libro"],
      scenario: "biblioteca cósmica, pergaminos flotantes, pluma de luz dorada",
    },
    {
      keywords: ["científico", "investigador", "laboratorio"],
      scenario:
        "laboratorio cuántico, fórmulas luminosas, experimentos cósmicos",
    },
    {
      keywords: ["deportista", "atleta", "deporte"],
      scenario: "estadio épico, trofeos dorados flotantes, energía de victoria",
    },
    {
      keywords: ["fotografo", "cámara", "imagen"],
      scenario: "estudio fotográfico místico, lentes mágicas, capturas de luz",
    },
    {
      keywords: ["vendedor", "comercial", "ventas"],
      scenario: "ciudad comercial dorada, gráficos de éxito, torres de cristal",
    },
  ];

  for (const mapping of scenarioMappings) {
    if (mapping.keywords.some((keyword) => lowerProf.includes(keyword))) {
      return mapping.scenario;
    }
  }

  // Escenario genérico si no se encuentra coincidencia
  return "entorno majestuoso y poderoso, elementos únicos de grandeza, iluminación épica cinematográfica";
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
