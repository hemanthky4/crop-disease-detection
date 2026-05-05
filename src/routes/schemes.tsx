import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FileText, ArrowLeft, ExternalLink, Filter } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  component: Page,
  head: () => ({ meta: [{ title: "Government Schemes — Agri-Market" }] }),
});

type SchemeCategory = "All" | "Subsidy" | "Insurance" | "Loan";

type Scheme = { 
  id: string; 
  title: string; 
  description: string; 
  eligibility: string | null; 
  link: string | null; 
  region: string | null;
  category?: SchemeCategory;
};

const DEFAULT_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Financial benefit of ₹6,000 per year provided to all landholding farmer families.",
    eligibility: "All landholding farmers subject to certain exclusion criteria.",
    link: "https://pmkisan.gov.in/",
    region: "National",
    category: "Subsidy"
  },
  {
    id: "pmfby",
    title: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    description: "Provides insurance cover against crop failure due to natural calamities, pests & diseases.",
    eligibility: "Farmers growing notified crops in notified areas, including sharecroppers.",
    link: "https://pmfby.gov.in/",
    region: "National",
    category: "Insurance"
  },
  {
    id: "kcc",
    title: "Kisan Credit Card (KCC)",
    description: "Provides adequate and timely credit support from the banking system for agricultural needs.",
    eligibility: "Farmers, tenant farmers, oral lessees, and sharecroppers.",
    link: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card",
    region: "National",
    category: "Loan"
  }
];

function Page() {
  const [items, setItems] = useState<Scheme[]>(DEFAULT_SCHEMES);
  const [filter, setFilter] = useState<SchemeCategory>("All");
  useEffect(() => {
    supabase.from("schemes").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        setItems([...DEFAULT_SCHEMES, ...(data as Scheme[])]);
      }
    });
  }, []);

  const filteredItems = items.filter(s => filter === "All" || s.category === filter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><FileText className="text-primary" />Government Schemes</h1>
        <p className="text-muted-foreground mt-2">Browse agricultural support programs and apply through official portals.</p>

        <div className="flex items-center gap-3 mt-6 mb-2 bg-background/50 p-2 rounded-xl border border-border w-fit">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <div className="flex gap-1">
            {(["All", "Subsidy", "Insurance", "Loan"] as SchemeCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {filteredItems.map(s => (
            <div key={s.id} className="p-6 rounded-2xl glassmorphism border border-border flex flex-col hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-xs uppercase tracking-wider text-primary font-bold bg-primary/10 px-2 py-1 rounded-md">{s.category || 'General'}</div>
                <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{s.region}</div>
              </div>
              <h3 className="font-bold text-xl mt-3 text-foreground">{s.title}</h3>
              <div className="mt-3 flex-1 space-y-3">
                <div>
                  <div className="text-sm font-semibold text-primary">Benefits:</div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
                {s.eligibility && (
                  <div>
                    <div className="text-sm font-semibold text-primary">Eligibility:</div>
                    <p className="text-sm text-muted-foreground">{s.eligibility}</p>
                  </div>
                )}
              </div>
              {s.link && (
                <a 
                  href={s.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-5 w-full ripple flex justify-center items-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md"
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
