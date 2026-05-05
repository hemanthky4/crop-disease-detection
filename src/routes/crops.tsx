import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Tractor } from "lucide-react";

export const Route = createFileRoute("/crops")({
  component: Page,
  head: () => ({ meta: [{ title: "Crops — Agri-Market" }] }),
});

const CROPS = [
  { name: "Rice", season: "Kharif", water: "High", soil: "Clayey", yield: "4-6 t/ha", emoji: "🌾" },
  { name: "Wheat", season: "Rabi", water: "Medium", soil: "Loamy", yield: "3-5 t/ha", emoji: "🌾" },
  { name: "Maize", season: "Kharif/Rabi", water: "Medium", soil: "Loamy/Sandy", yield: "5-8 t/ha", emoji: "🌽" },
  { name: "Sugarcane", season: "Year-round", water: "Very High", soil: "Loamy", yield: "70-100 t/ha", emoji: "🎋" },
  { name: "Cotton", season: "Kharif", water: "Medium", soil: "Black soil", yield: "0.5-1.5 t/ha", emoji: "🌱" },
  { name: "Soybean", season: "Kharif", water: "Medium", soil: "Loamy", yield: "1-2 t/ha", emoji: "🫘" },
  { name: "Tomato", season: "All seasons", water: "Medium", soil: "Sandy loam", yield: "20-40 t/ha", emoji: "🍅" },
  { name: "Potato", season: "Rabi", water: "Medium", soil: "Sandy loam", yield: "20-30 t/ha", emoji: "🥔" },
  { name: "Onion", season: "Rabi", water: "Medium", soil: "Loamy", yield: "15-25 t/ha", emoji: "🧅" },
];

function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><Tractor className="text-primary" />Agricultural Crops</h1>
        <p className="text-muted-foreground mt-2">Reference for major crops, growing seasons, and yields.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {CROPS.map(c => (
            <div key={c.name} className="p-6 rounded-2xl bg-card border border-border">
              <div className="text-5xl">{c.emoji}</div>
              <h3 className="font-bold text-xl text-primary mt-3">{c.name}</h3>
              <dl className="mt-3 text-sm space-y-1">
                <div className="flex justify-between"><dt className="text-muted-foreground">Season</dt><dd>{c.season}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Water</dt><dd>{c.water}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Soil</dt><dd>{c.soil}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Yield</dt><dd>{c.yield}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
