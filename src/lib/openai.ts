import { getResponseTokenLimit } from "@/lib/openai-limits";

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export async function callOpenAI(params: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model ?? "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: getResponseTokenLimit(),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!response.ok || !content) {
    const errorMessage = data.error?.message ?? "Model response error";
    throw new Error(errorMessage);
  }

  return content;
}
