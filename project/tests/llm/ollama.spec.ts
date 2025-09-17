import { describe, it, expect, beforeEach } from "vitest";
// @ts-expect-error from setup
const agent = (global as any).__mockAgent as import("undici").MockAgent;

import { OllamaProvider } from "@/llm/ollama";

describe("OllamaProvider", () => {
  let provider: OllamaProvider;

  beforeEach(() => {
    // Reset all interceptors
    agent.get("http://localhost:11434").intercept({ path: "/api/generate", method: "POST" }).reply(200, {});
    provider = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      model: "llama3.1:8b-instruct",
      timeout: 30000
    });
  });

  it("generates completion (happy path)", async () => {
    agent.get("http://localhost:11434")
      .intercept({ path: "/api/generate", method: "POST" })
      .reply(200, { 
        model: "llama3.1:8b-instruct", 
        response: "Hello, world!", 
        done: true,
        context: [1, 2, 3],
        total_duration: 1000000000,
        load_duration: 100000000,
        prompt_eval_count: 10,
        prompt_eval_duration: 200000000,
        eval_count: 5,
        eval_duration: 300000000
      });

    const out = await provider.chat({ 
      messages: [{ role: "user", content: "ping" }] 
    });
    expect(out).toBeDefined();
    expect(out.text).toBe("Hello, world!");
  });

  it("handles 500 with LLMError", async () => {
    agent.get("http://localhost:11434")
      .intercept({ path: "/api/generate", method: "POST" })
      .reply(500, { error: "boom" });

    await expect(() => provider.chat({ 
      messages: [{ role: "user", content: "ping" }] 
    })).rejects.toThrowError();
  });
});
