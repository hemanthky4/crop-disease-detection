import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/crop-recommend")({
  component: Page,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Crop Recommendations — Agri-Market" }] }),
});

type Crop = { name: string; why: string; tips: string };

function Page() {
  const [form, setForm] = useState({ soil: "loamy", climate: "tropical", region: "India", season: "summer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setCrops([]);
    const { data, error } = await supabase.functions.invoke("crop-recommend", { body: form });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if ((data as any)?.error) { setError((data as any).error); return; }
    setCrops((data as any)?.crops ?? []);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back to dashboard</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><Sprout className="text-primary" />Crop Recommendations</h1>
        <p className="text-muted-foreground mt-2">Tell us about your land — our AI suggests the best crops to plant.</p>

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4 mt-8 p-6 rounded-2xl bg-card border border-border">
          {(["soil", "climate", "region", "season"] as const).map(k => (
            <label key={k} className="text-sm">
              <span className="capitalize font-medium">{k}</span>
              <Input className="mt-1" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required />
            </label>
          ))}
          <div className="sm:col-span-2"><Button variant="hero" type="submit" disabled={loading}>{loading ? "Analyzing…" : "Get recommendations"}</Button></div>
        </form>

        {error && <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {crops.map(c => (
            <div key={c.name} className="p-5 rounded-2xl bg-card border border-border">
              <h3 className="font-bold text-lg text-primary">{c.name}</h3>
              <p className="text-sm mt-2"><strong>Why:</strong> {c.why}</p>
              <p className="text-sm mt-2 text-muted-foreground"><strong>Tips:</strong> {c.tips}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
