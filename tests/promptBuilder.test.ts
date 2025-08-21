import { describe, it, expect } from "vitest";
import {
  buildImagePrompt,
  buildTextPrompt,
  buildNegativePrompt,
  buildWhatsAppMessage,
  validatePromptParams,
  getProfessionConfig,
  PROFESSION_CONFIGS,
} from "../src/lib/promptBuilder";

describe("PromptBuilder", () => {
  describe("buildImagePrompt", () => {
    it("should build image prompt for standard profession", () => {
      const prompt = buildImagePrompt("María González", "Ingenier@");

      expect(prompt).toContain("María González");
      expect(prompt).toContain("Ingeniero");
      expect(prompt).toContain("epic superhero");
      expect(prompt).toContain("exoesqueleto tecnológico");
      expect(prompt).toContain("realistic face identical");
    });

    it("should build image prompt for custom profession", () => {
      const prompt = buildImagePrompt("Juan Pérez", "Data Scientist");

      expect(prompt).toContain("Juan Pérez");
      expect(prompt).toContain("Data Scientist");
      expect(prompt).toContain("epic superhero");
    });

    it("should include required quality keywords", () => {
      const prompt = buildImagePrompt("Test User", "Docente");

      expect(prompt).toContain("ultra-detailed");
      expect(prompt).toContain("dramatic lighting");
      expect(prompt).toContain("cinematic");
      expect(prompt).toContain("8k");
      expect(prompt).toContain("masterpiece");
    });
  });

  describe("buildTextPrompt", () => {
    it("should build text prompt with name and profession", () => {
      const prompt = buildTextPrompt("Ana Martín", "Médico");

      expect(prompt).toContain("Ana Martín");
      expect(prompt).toContain("Médico");
      expect(prompt).toContain("25–60 palabras");
      expect(prompt).toContain("Sin emojis");
      expect(prompt).toContain("sin comillas");
    });

    it("should specify Spanish language requirement", () => {
      const prompt = buildTextPrompt("Carlos Silva", "Chef");

      expect(prompt).toContain("Tono épico, motivacional, inclusivo");
      expect(prompt).toContain("2–3 líneas");
    });
  });

  describe("buildNegativePrompt", () => {
    it("should include quality exclusions", () => {
      const negativePrompt = buildNegativePrompt();

      expect(negativePrompt).toContain("deformed face");
      expect(negativePrompt).toContain("disfigured");
      expect(negativePrompt).toContain("low-res");
      expect(negativePrompt).toContain("blurry");
      expect(negativePrompt).toContain("bad anatomy");
    });
  });

  describe("buildWhatsAppMessage", () => {
    it("should create properly formatted WhatsApp message", () => {
      const message = buildWhatsAppMessage(
        "Elena García",
        "Arquitecto",
        "Elena García demuestra cada día por qué la arquitectura vale tanto en nuestra empresa.",
        "https://example.com/image.jpg"
      );

      expect(message).toContain("Mira mi postal épica ✨");
      expect(message).toContain("Nombre: Elena García");
      expect(message).toContain("Profesión: Arquitecto");
      expect(message).toContain("Elena García demuestra");
      expect(message).toContain("https://example.com/image.jpg");
    });

    it("should separate sections with double newlines", () => {
      const message = buildWhatsAppMessage(
        "Test User",
        "Test Prof",
        "Test description",
        "test-url"
      );

      const sections = message.split("\n\n");
      expect(sections).toHaveLength(5);
    });
  });

  describe("validatePromptParams", () => {
    it("should validate correct parameters", () => {
      const result = validatePromptParams("María González", "Ingeniero");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject empty name", () => {
      const result = validatePromptParams("", "Ingeniero");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("nombre debe tener al menos 2 caracteres");
    });

    it("should reject short name", () => {
      const result = validatePromptParams("A", "Ingeniero");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("nombre debe tener al menos 2 caracteres");
    });

    it("should reject long name", () => {
      const longName = "A".repeat(61);
      const result = validatePromptParams(longName, "Ingeniero");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("no puede tener más de 60 caracteres");
    });

    it("should reject empty profession", () => {
      const result = validatePromptParams("Juan Pérez", "");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Debes seleccionar una profesión");
    });

    it("should accept names with special characters", () => {
      const result = validatePromptParams("José María Ñuñez", "Docente");

      expect(result.valid).toBe(true);
    });
  });

  describe("getProfessionConfig", () => {
    it("should return config for standard profession", () => {
      const config = getProfessionConfig("Médico");

      expect(config.value).toBe("Médico");
      expect(config.label).toBe("Médico");
      expect(config.scenario).toContain("armadura sanitaria");
    });

    it("should return custom config for unknown profession", () => {
      const config = getProfessionConfig("Data Scientist");

      expect(config.value).toBe("Data Scientist");
      expect(config.label).toBe("Data Scientist");
      expect(config.scenario).toContain("majestuoso");
    });

    it("should detect programming-related professions", () => {
      const config = getProfessionConfig("Programador Frontend");

      expect(config.scenario).toContain("código digital");
    });

    it("should detect art-related professions", () => {
      const config = getProfessionConfig("Artista Digital");

      expect(config.scenario).toContain("estudio artístico");
    });
  });

  describe("PROFESSION_CONFIGS", () => {
    it("should have all required professions", () => {
      const expectedProfessions = [
        "Ingeniero",
        "Abogado",
        "Médico",
        "Diseñador",
        "Docente",
        "Chef",
        "Arquitecto",
        "Emprendedor",
        "Músico",
        "Personalizada",
      ];

      const configValues = PROFESSION_CONFIGS.map((p) => p.value);

      expectedProfessions.forEach((profession) => {
        expect(configValues).toContain(profession);
      });
    });

    it("should have unique scenarios for each profession", () => {
      const scenarios = PROFESSION_CONFIGS.map((p) => p.scenario);
      const uniqueScenarios = new Set(scenarios);

      expect(uniqueScenarios.size).toBe(scenarios.length);
    });

    it("should have non-empty scenarios", () => {
      PROFESSION_CONFIGS.forEach((config) => {
        expect(config.scenario).toBeTruthy();
        expect(config.scenario.length).toBeGreaterThan(10);
      });
    });
  });
});
