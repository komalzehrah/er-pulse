import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const generateHandoffSummary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ notes: z.string().min(1).max(20000) }).parse(d))
  .handler(async ({ data }) => {
    const { generateHandoff } = await import("./handoff.server");
    try {
      return { summary: await generateHandoff(data.notes), error: null as string | null };
    } catch (e) {
      return { summary: null, error: e instanceof Error ? e.message : "Failed to generate summary." };
    }
  });
