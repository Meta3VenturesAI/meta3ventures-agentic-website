import { describe, it, expect } from "vitest";
import { OllamaProvider } from "@/llm/ollama";
import { VLLMProvider } from "@/llm/vllm";

describe("LLM Providers", () => {
  it("should instantiate OllamaProvider", () => {
    const provider = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      model: "llama3.1:8b-instruct",
      timeout: 30000
    });
    expect(provider).toBeDefined();
    expect(provider.healthCheck).toBeDefined();
  });

  it("should instantiate VLLMProvider", () => {
    const provider = new VLLMProvider({
      baseUrl: "http://localhost:8000/v1",
      model: "mistral-7b-instruct",
      timeout: 30000
    });
    expect(provider).toBeDefined();
    expect(provider.healthCheck).toBeDefined();
  });
});
