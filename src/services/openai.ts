import type { Athlete } from "../hooks/useAthletes";

export type ScoutingReport = {
  overall_rating: number;
  strengths: string[];
  weaknesses: string[];
  technical_skills: Record<string, number>;
  physical_attributes: {
    speed: number;
    agility: number;
    strength: number;
  };
  recommendations: string[];
  summary: string;
};

type OpenAIResponse = {
  choices: Array<{ message: { content: string } }>;
  error?: { message: string };
};

export async function analyseVideoFrames(
  frames: string[],
  athlete: Pick<Athlete, "name" | "sport" | "position">,
): Promise<ScoutingReport> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;

  if (!apiKey) {
    throw new Error(
      "VITE_OPENAI_API_KEY is not configured. Add it to your .env.local file.",
    );
  }

  console.log(
    "[analyseVideoFrames] sending",
    frames.length,
    "frames to OpenAI GPT-4o",
  );

  const userPrompt = `Athlete: ${athlete.name}, Sport: ${athlete.sport}, Position: ${
    athlete.position ?? "Unknown"
  }. Analyse their technique, movement, positioning, strengths, and weaknesses from these video frames.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sports scout. Analyse the provided video frames of an athlete and return a structured JSON scouting report.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            ...frames.map((frame) => ({
              type: "image_url",
              image_url: { url: frame, detail: "low" },
            })),
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as OpenAIResponse;
    const msg = err.error?.message ?? `OpenAI API error (${response.status})`;
    console.error("[analyseVideoFrames] API error:", msg);
    throw new Error(msg);
  }

  const data = (await response.json()) as OpenAIResponse;
  const raw = data.choices[0]?.message?.content ?? "{}";
  console.log("[analyseVideoFrames] response received, parsing JSON");
  return JSON.parse(raw) as ScoutingReport;
}
