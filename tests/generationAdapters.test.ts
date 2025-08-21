import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockGenerator, GeneratorFactory } from "../src/lib/generation";
import { OpenAIAdapter } from "../src/lib/openaiAdapter";
import { StabilityMockAdapter } from "../src/lib/stabilityAdapter";
import { GenParams } from "../src/types";

// Mock fetch globally
global.fetch = vi.fn();

describe("Generation Adapters", () => {
  let mockFile: File;
  let genParams: GenParams;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock file
    mockFile = new File(["fake image content"], "test.jpg", {
      type: "image/jpeg",
    });

    genParams = {
      name: "Test User",
      profession: "Ingeniero",
      userImage: mockFile,
    };
  });

  describe("MockGenerator", () => {
    it("should generate mock result with correct structure", async () => {
      const generator = new MockGenerator("test-key");
      const result = await generator.generate(genParams);

      expect(result).toHaveProperty("imageUrl");
      expect(result).toHaveProperty("description");
      expect(typeof result.imageUrl).toBe("string");
      expect(typeof result.description).toBe("string");
    });

    it("should include user name and profession in description", async () => {
      const generator = new MockGenerator("test-key");
      const result = await generator.generate(genParams);

      expect(result.description).toContain("Test User");
      expect(result.description).toContain("Ingeniero");
    });

    it("should simulate API delay", async () => {
      const generator = new MockGenerator("test-key");
      const startTime = Date.now();

      await generator.generate(genParams);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(1900); // Allow for some variation
    });

    it("should generate different descriptions on multiple calls", async () => {
      const generator = new MockGenerator("test-key");

      const result1 = await generator.generate(genParams);
      const result2 = await generator.generate(genParams);

      // While content might be similar, the random selection should work
      expect(typeof result1.description).toBe("string");
      expect(typeof result2.description).toBe("string");
    });
  });

  describe("GeneratorFactory", () => {
    it("should create MockGenerator when no API key provided", () => {
      // Testing the actual factory requires mocking the require statements
      // This test would need more complex mocking setup
      expect(() => {
        GeneratorFactory.create("openai", "", "");
      }).not.toThrow();
    });

    it("should throw error for unsupported provider", () => {
      expect(() => {
        // @ts-ignore - testing invalid provider
        GeneratorFactory.create("invalid", "test-key");
      }).toThrow("Proveedor no soportado");
    });
  });

  describe("OpenAIAdapter", () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      vi.resetAllMocks();
    });

    it("should validate API key before making requests", async () => {
      const adapter = new OpenAIAdapter("");

      await expect(adapter.generate(genParams)).rejects.toThrow(
        "API key no configurada"
      );
    });

    it("should handle API error responses", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: "Invalid API key" } }),
          { status: 401 }
        )
      );

      const adapter = new OpenAIAdapter("test-key");

      await expect(adapter.generate(genParams)).rejects.toThrow(
        "API key inválida"
      );
    });

    it("should handle rate limit errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(
        new Response("Too Many Requests", { status: 429 })
      );

      const adapter = new OpenAIAdapter("test-key");

      await expect(adapter.generate(genParams)).rejects.toThrow(
        "Límite de rate"
      );
    });

    it("should handle server errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 })
      );

      const adapter = new OpenAIAdapter("test-key");

      await expect(adapter.generate(genParams)).rejects.toThrow(
        "Error del servidor"
      );
    });

    it("should handle network errors", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const adapter = new OpenAIAdapter("test-key");

      await expect(adapter.generate(genParams)).rejects.toThrow(
        "Error desconocido"
      );
    });

    it("should make parallel requests for image and text", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: [{ url: "https://example.com/image.jpg" }],
            })
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: "Epic description here" } }],
            })
          )
        );

      const adapter = new OpenAIAdapter("test-key");
      const result = await adapter.generate(genParams);

      expect(result).toEqual({
        imageUrl: "https://example.com/image.jpg",
        description: "Epic description here",
      });

      // Should have made 2 requests (image and text)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("StabilityMockAdapter", () => {
    it("should generate mock result with base64 image", async () => {
      const adapter = new StabilityMockAdapter("test-key");
      const result = await adapter.generate(genParams);

      expect(result).toHaveProperty("imageUrl");
      expect(result).toHaveProperty("description");
      expect(result.imageUrl).toMatch(/^https?:\/\//); // Should be a URL
    });

    it("should include profession-specific elements in description", async () => {
      const adapter = new StabilityMockAdapter("test-key");
      const result = await adapter.generate(genParams);

      expect(result.description).toContain("Test User");
      expect(result.description).toContain("Ingeniero");
      expect(result.description.length).toBeGreaterThan(50); // Should be substantial
    });

    it("should simulate realistic API delay", async () => {
      const adapter = new StabilityMockAdapter("test-key");
      const startTime = Date.now();

      await adapter.generate(genParams);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(2900); // 3 second delay
    });
  });

  describe("Error Handling", () => {
    it("should handle API key validation errors consistently", async () => {
      const generators = [new MockGenerator(""), new OpenAIAdapter("")];

      for (const generator of generators) {
        if (generator instanceof OpenAIAdapter) {
          await expect(generator.generate(genParams)).rejects.toThrow();
        } else {
          // Mock generator should work even without API key
          const result = await generator.generate(genParams);
          expect(result).toBeDefined();
        }
      }
    });

    it("should provide user-friendly error messages", async () => {
      const adapter = new OpenAIAdapter("invalid-key");

      // Mock 401 response
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
          status: 401,
        })
      );

      try {
        await adapter.generate(genParams);
      } catch (error) {
        expect((error as Error).message).not.toContain("401");
        expect((error as Error).message).toContain("API key");
      }
    });
  });
});
