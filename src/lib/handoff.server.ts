import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

const INSTRUCTIONS = `You are an experienced emergency department charge nurse writing a shift handoff (SBAR-style) for the incoming team.
Write a concise summary in Markdown, at most ~250 words, with these short sections:
**Situation** (census, acuity mix, waiting-room status), **Critical patients** (ESI 1-2 and anyone overdue, with pending items),
**Staffing** (ratios vs targets, gaps, shift changes), **External risks** (incidents/EMS likely to drive volume),
**Action items** (3-5 prioritized bullets). Use only the data given; do not invent patients or facts. Be direct and clinical.`;

export async function generateHandoff(input: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured (missing key).");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  let streamError: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    messages: [{ role: "user", content: input }],
    onError: ({ error }) => { streamError = error; },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (!text.trim()) {
    const e = streamError as { statusCode?: number; message?: string } | undefined;
    if (e?.statusCode === 429) throw new Error("AI is busy right now. Please wait a moment and try again.");
    if (e?.statusCode === 402) throw new Error("AI credits are used up. Add credits in workspace billing settings.");
    throw new Error(e?.message || "The AI returned no summary.");
  }
  return text;
}
