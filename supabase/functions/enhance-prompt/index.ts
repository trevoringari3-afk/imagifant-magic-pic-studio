import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a world-class prompt engineer for text-to-image models.
Rewrite the user's idea into ONE vivid, richly detailed image prompt.
Include subject, composition, lighting, mood, color palette, lens/medium and level of detail.
Keep it under 120 words. Do not add explanations, quotes, lists or headings. Output only the prompt text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();

    if (!prompt || !String(prompt).trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const userInput = style && style !== "none"
      ? `Idea: ${prompt}\nPreferred visual style: ${style}`
      : `Idea: ${prompt}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM_PROMPT,
        input: userInput,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
        store: false,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("AI gateway error:", res.status, errorText);
      if (res.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests right now. Please try again in a moment." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 },
        );
      }
      if (res.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits are exhausted. Please add credits to your workspace." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 },
        );
      }
      return new Response(JSON.stringify({ error: "Failed to enhance prompt" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && !text) {
            text = evt.response?.output_text ?? "";
          }
        } catch (_) {
          // ignore keep-alive / partial frames
        }
      }
    }

    const enhanced = text.trim();
    if (!enhanced) {
      return new Response(
        JSON.stringify({ error: "The AI returned an empty prompt. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 },
      );
    }

    return new Response(JSON.stringify({ prompt: enhanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("enhance-prompt error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
