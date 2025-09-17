export class LLMError extends Error { 
  constructor(msg: string, public override cause?: unknown) {
    super(msg);
    this.name = "LLMError";
  }
}

export const normalizeError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

export function handleLLMError(ctx: string, e: unknown): never {
  const err = normalizeError(e);
  throw new LLMError(`[${ctx}] ${err.message}`, err);
}
