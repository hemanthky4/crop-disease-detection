// AI crop recommendations via Lovable AI Gateway
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { soil, climate, region, season } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an agronomy expert. Reply with strict JSON: {\"crops\":[{\"name\":string,\"why\":string,\"tips\":string}]} — 4 crops max, no markdown, no preamble." },
          { role: "user", content: `Soil: ${soil}\nClimate: ${climate}\nRegion: ${region}\nSeason: ${season}\nRecommend the best crops to plant.` },
        ],
      }),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits required. Add credits in Lovable workspace." }), { status: 402, headers: { ...cors, "Content-Type": "application/json" } });
    const data = await r.json();
    let text: string = data?.choices?.[0]?.message?.content ?? "{}";
    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
