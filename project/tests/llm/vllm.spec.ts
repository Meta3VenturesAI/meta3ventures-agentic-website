import { describe, it, expect, beforeEach } from "vitest";
// @ts-expect-error from setup
const agent = (global as any).__mockAgent as import("undici").MockAgent;

import { VLLMProvider } from "@/llm/vllm";

describe("VLLMProvider", () => {
  let provider: VLLMProvider;

  beforeEach(() => {
    // Reset all interceptors
    agent.get("http://localhost:8000").intercept({ path: "/v1/chat/completions", method: "POST" }).reply(200, {});
    provider = new VLLMProvider({
      baseUrl: "http://localhost:8000/v1",
      model: "mistral-7b-instruct",
      timeout: 30000
    });
  });

  it("completes via OpenAI-compatible API", async () => {
    agent.get("http://localhost:8000")
      .intercept({ path: "/v1/chat/completions", method: "POST" })
      .reply(200, { 
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1677652288,
        model: "mistral-7b-instruct",
        choices: [{ 
          index: 0,
          message: { 
            role: "assistant", 
            content: "Hello, world!" 
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      });

    const out = await provider.chat({ 
      messages: [{ role: "user", content: "hi" }] 
    });
    expect(out).toBeDefined();
    expect(out.text).toBe("Hello, world!");
  });

  it("handles 500 with LLMError", async () => {
    agent.get("http://localhost:8000")
      .intercept({ path: "/v1/chat/completions", method: "POST" })
      .reply(500, { 
        error: {
          message: "Internal server error",
          type: "server_error",
          code: "internal_error"
        }
      });

    await expect(() => provider.chat({ 
      messages: [{ role: "user", content: "hi" }] 
    })).rejects.toThrowError();
  });
});
