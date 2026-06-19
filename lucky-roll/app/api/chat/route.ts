import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { anthropic, CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/claude/client";
import { luckyRollTools } from "@/lib/claude/tools";
import { executeTool } from "@/lib/claude/executor";
import { NextResponse } from "next/server";

const MAX_ITERATIONS = 8;

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ontbreekt op de server." },
      { status: 500 }
    );
  }

  const { messages: clientMessages } = (await req.json()) as {
    messages: ClientMessage[];
  };

  // Bouw de gespreksgeschiedenis op
  const messages: Anthropic.MessageParam[] = clientMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let mutated = false;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: luckyRollTools,
        messages,
      });

      if (response.stop_reason !== "tool_use") {
        // Klaar — verzamel de tekst
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        return NextResponse.json({
          reply: text || "Klaar!",
          mutated,
        });
      }

      // Voer tool-aanroepen uit
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUseBlocks) {
        const result = await executeTool(
          tool.name,
          tool.input as Record<string, unknown>,
          supabase,
          user.id
        );
        if (result.mutated) mutated = true;
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: result.content,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({
      reply: "Het lukte niet om dit binnen de limiet af te ronden. Probeer het op te splitsen.",
      mutated,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "De AI is even druk. Probeer het zo opnieuw." },
        { status: 429 }
      );
    }
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
