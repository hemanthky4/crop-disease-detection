import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/yield-predict")({
  component: Page,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Yield Predictor — Agri-Market" }] }),
});

type Prediction = {
  estimated_yield: string;
  yield_per_unit: string;
  confidence: "low" | "medium" | "high";
  key_factors: string[];
  recommendations: string[];
};

function Page() {
  const [form, setForm] = useState({
    crop: "Wheat",
    area: "1",
    areaUnit: "hectare",
    soil: "loamy",
    irrigation: "drip",
    region: "India",
    season: "winter",
    fertilizer: "moderate",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    const { data, error } = await supabase.functions.invoke("yield-predict", { body: form });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if ((data as any)?.error) { setError((data as any).error); return; }
    setResult(data as Prediction);
  };

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "crop", label: "Crop" },
    { key: "area", label: "Area" },
    { key: "areaUnit", label: "Area Unit (hectare/acre)" },
    { key: "soil", label: "Soil Type" },
    { key: "irrigation", label: "Irrigation (drip/flood/rainfed)" },
    { key: "region", label: "Region" },
    { key: "season", label: "Season" },
    { key: "fertilizer", label: "Fertilizer (low/moderate/high)" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back to dashboard</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><TrendingUp className="text-primary" />Yield Predictor</h1>
        <p className="text-muted-foreground mt-2">Estimate your harvest based on crop, land, soil, and growing conditions.</p>

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4 mt-8 p-6 rounded-2xl bg-card border border-border">
          {fields.map(({ key, label }) => (
            <label key={key} className="text-sm">
              <span className="font-medium">{label}</span>
              <Input className="mt-1" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
            </label>
          ))}
          <div className="sm:col-span-2"><Button variant="hero" type="submit" disabled={loading}>{loading ? "Predicting…" : "Predict yield"}</Button></div>
        </form>

        {error && <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {result && (
          <div className="mt-6 grid gap-4">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <h3 className="text-2xl font-bold text-primary">{result.estimated_yield}</h3>
                <span className="text-sm uppercase tracking-wide px-3 py-1 rounded-full bg-primary/10 text-primary">{result.confidence} confidence</span>
              </div>
              <p className="text-muted-foreground mt-1">{result.yield_per_unit}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h4 className="font-bold text-primary mb-2">Key Factors</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {result.key_factors?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h4 className="font-bold text-primary mb-2">Recommendations</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {result.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
