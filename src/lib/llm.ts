export const LLM_BASE_URL = "https://api.experientiallabs.ai/v1";
export const LLM_MODEL = "gpt-5.6-luna";

export function llmApiKey(): string {
  const key = process.env.EXPLABS_API_KEY;
  if (!key) {
    throw new Error(
      "EXPLABS_API_KEY is not set. Create one under Settings -> API Keys and export it."
    );
  }
  return key;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
};

export type ChatCompletionOptions = {
  messages: ChatMessage[];
  stream?: boolean;
  tools?: unknown[];
  temperature?: number;
  max_tokens?: number;
};

export async function createChatCompletion(options: ChatCompletionOptions) {
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmApiKey()}`,
    },
    body: JSON.stringify({ model: LLM_MODEL, ...options }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM request failed: ${res.status} ${res.statusText} ${detail}`);
  }
  if (options.stream) return res.body;
  return res.json();
}
