// AI crop-disease detection from an uploaded image (data URL)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { imageDataUrl, notes } = await req.json();
    if (!imageDataUrl) return new Response(JSON.stringify({ error: "imageDataUrl required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a plant pathologist. Reply STRICT JSON: {\"disease\":string,\"confidence\":\"low|medium|high\",\"symptoms\":string,\"treatment\":string,\"prevention\":string}. No markdown." },
          { role: "user", content: [
            { type: "text", text: `Identify any disease in this crop image. Notes: ${notes ?? "none"}` },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ] },
        ],
      }),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits required." }), { status: 402, headers: { ...cors, "Content-Type": "application/json" } });
    const data = await r.json();
    let text: string = data?.choices?.[0]?.message?.content ?? "{}";
    text = text.replace(/```json|```/g, "").trim();
    return new Response(text, { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
