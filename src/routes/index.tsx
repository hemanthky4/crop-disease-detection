import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Users, ShieldCheck } from "lucide-react";

const FarmScene = lazy(() => import("@/components/FarmScene").then(m => ({ default: m.FarmScene })));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Agri-Market — A Modern Marketplace for Farmers" },
      { name: "description", content: "Sell crops, buy supplies, and grow your farm with Agri-Market — the all-in-one digital companion for modern agriculture." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Sprout className="w-3.5 h-3.5" /> Built for farmers
              </span>
              <h1 className="mt-5 text-5xl md:text-6xl font-bold leading-[1.05]">
                Where the <span className="text-primary">harvest</span> meets the marketplace.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-md">
                Sell crops directly to buyers, source quality supplies, and track your farm — all from one beautiful, modern platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup"><Button variant="hero" size="lg">Start free</Button></Link>
                <Link to="/login"><Button variant="outline" size="lg">I have an account</Button></Link>
              </div>
              <div className="mt-10 flex gap-6 text-sm text-muted-foreground">
                <div><div className="text-2xl font-display font-bold text-foreground">12k+</div>Farmers</div>
                <div><div className="text-2xl font-display font-bold text-foreground">98%</div>Satisfaction</div>
                <div><div className="text-2xl font-display font-bold text-foreground">24/7</div>Support</div>
              </div>
            </div>

            <div className="relative h-[420px] md:h-[520px] rounded-2xl overflow-hidden shadow-[var(--shadow-elegant)] border border-border bg-[image:var(--gradient-sky)]">
              <Suspense fallback={<div className="w-full h-full grid place-items-center text-muted-foreground">Loading 3D scene…</div>}>
                <FarmScene />
              </Suspense>
              <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-widest text-foreground/60 bg-background/70 backdrop-blur px-2 py-1 rounded">Drag to explore</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Everything your farm needs</h2>
          <p className="text-muted-foreground text-center mt-3 max-w-xl mx-auto">From seed to sale — tools that grow with you.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Live Market Prices", desc: "Real-time pricing on crops and produce in your region." },
              { icon: Users, title: "Direct Buyers", desc: "Connect with verified buyers — no middlemen." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Get paid safely and on time, every harvest." },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-shadow">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary grid place-items-center"><f.icon className="w-5 h-5" /></div>
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-2xl p-10 md:p-16 bg-[image:var(--gradient-hero)] text-primary-foreground text-center shadow-[var(--shadow-elegant)]">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to grow with Agri-Market?</h2>
            <p className="mt-3 opacity-90">Create your account in under a minute.</p>
            <div className="mt-6"><Link to="/signup"><Button size="lg" className="bg-background text-primary hover:bg-background/90">Get started free</Button></Link></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Agri-Market. Cultivated with care.
      </footer>
    </div>
  );
}
