import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, Plus, ExternalLink, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  component: Page,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Marketplace — Agri-Market" }] }),
});

type Product = { 
  id: string; 
  name: string; 
  category: string; 
  description: string | null; 
  price: number; 
  unit: string; 
  stock: number; 
  seller_id: string;
  image?: string;
};

function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string>("local-user");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "fertilizer", description: "", price: "", unit: "kg", stock: "", image: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("crop_marketplace_products_v7");
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        // PRODUCT DATA: 10 default agricultural products using completely local, offline-ready images
        const defaultProducts: Product[] = [
          { id: "1", name: "Urea Fertilizer", category: "fertilizer", description: "High nitrogen fertilizer for rapid growth and green leaves.", price: 300, unit: "bag", stock: 50, seller_id: "sys", image: "/products/1.jpg" },
          { id: "2", name: "Organic Compost", category: "soil", description: "100% natural compost to enrich soil fertility and structure.", price: 150, unit: "kg", stock: 120, seller_id: "sys", image: "/products/2.jpg" },
          { id: "3", name: "Neem Oil Pesticide", category: "pesticide", description: "Natural, safe pesticide to protect crops from harmful insects.", price: 250, unit: "L", stock: 80, seller_id: "sys", image: "/products/3.jpg" },
          { id: "4", name: "Bio Fertilizer", category: "fertilizer", description: "Eco-friendly bio fertilizer containing living microorganisms.", price: 400, unit: "kg", stock: 40, seller_id: "sys", image: "/products/4.jpg" },
          { id: "5", name: "Potash Fertilizer", category: "fertilizer", description: "Essential for plant health, water retention, and disease resistance.", price: 350, unit: "bag", stock: 60, seller_id: "sys", image: "/products/5.jpg" },
          { id: "6", name: "Zinc Sulphate", category: "nutrient", description: "Crucial micronutrient for optimal crop development.", price: 200, unit: "kg", stock: 100, seller_id: "sys", image: "/products/6.jpg" },
          { id: "7", name: "Liquid Fertilizer", category: "fertilizer", description: "Fast-acting liquid fertilizer for immediate nutrient absorption.", price: 500, unit: "L", stock: 35, seller_id: "sys", image: "/products/7.jpg" },
          { id: "8", name: "Herbicide Spray", category: "herbicide", description: "Effective weed control to protect your main crop yield.", price: 450, unit: "L", stock: 75, seller_id: "sys", image: "/products/8.jpg" },
          { id: "9", name: "Insecticide Powder", category: "pesticide", description: "Powerful contact insecticide for severe pest outbreaks.", price: 220, unit: "kg", stock: 90, seller_id: "sys", image: "/products/9.jpg" },
          { id: "10", name: "Soil Conditioner", category: "soil", description: "Improves soil aeration and water holding capacity.", price: 180, unit: "kg", stock: 110, seller_id: "sys", image: "/products/10.jpg" }
        ];
        saveToLocalStorage(defaultProducts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveToLocalStorage = (newProducts: Product[]) => {
    localStorage.setItem("crop_marketplace_products_v7", JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.id) setUserId(data.session.user.id);
    });
    loadFromLocalStorage();
  }, []);

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        seller_id: userId,
        name: form.name,
        category: form.category,
        description: form.description,
        price: parseFloat(form.price) || 0,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        image: form.image
      };
      
      saveToLocalStorage([newProduct, ...products]);
      setShowForm(false);
      setForm({ name: "", category: "fertilizer", description: "", price: "", unit: "kg", stock: "", image: "" });
      setMsg("Product successfully listed!");
      setTimeout(() => setMsg(null), 3000);
    } catch (error: any) {
      setMsg(error.message || "Failed to add product");
    }
  };

  const buy = (p: Product) => {
    if (p.stock < 1) { setMsg("Out of stock"); return; }
    
    // Decrease stock locally
    const updatedProducts = products.map(prod => 
      prod.id === p.id ? { ...prod, stock: prod.stock - 1 } : prod
    );
    saveToLocalStorage(updatedProducts);
    
    setMsg(`Ordered ${p.name} successfully!`);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back</Link>
        <div className="flex justify-between items-center mt-3">
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="text-primary" />Marketplace</h1>
          <Button onClick={() => setShowForm(s => !s)} variant="hero"><Plus className="w-4 h-4" />Sell a product</Button>
        </div>

        {msg && <div className="mt-4 p-3 rounded bg-primary/10 text-primary text-sm">{msg}</div>}

        {showForm && (
          <form onSubmit={addProduct} className="mt-6 p-6 rounded-2xl glassmorphism border border-border grid sm:grid-cols-2 gap-4 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="sm:col-span-2 font-bold text-lg mb-2">List a New Product</h2>
            <Input placeholder="Product Name (e.g. Urea)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Category (e.g. fertilizer, seed)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Price (₹)" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <Input placeholder="Unit (kg, L, pcs)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            <Input placeholder="Stock available" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <Input placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            </div>
            <Textarea placeholder="Description" className="sm:col-span-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Button type="submit" className="sm:col-span-2 ripple" variant="hero">List product</Button>
          </form>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 glassmorphism rounded-2xl">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No products available yet. Be the first to list one!</p>
            </div>
          )}
          
          {products.map(p => {
            // IMAGE FIX: Replace keyword dynamically using product name
            const imageUrl = p.image || `https://source.unsplash.com/400x250/?${encodeURIComponent(p.name)}`;
            
            return (
            <div key={p.id} className="p-0 rounded-2xl glassmorphism border border-border flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[var(--shadow-elegant)] group">
              <div className="overflow-hidden bg-secondary/20 relative">
                <img 
                  src={imageUrl} 
                  alt={p.name} 
                  className="w-full h-48 object-cover border-b border-border transition-transform duration-500 group-hover:scale-110" 
                  onError={(e) => {
                    // Fallback if Unsplash fails or image is broken
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1592982537447-6f296338a2bc?w=400&q=80'; // generic agriculture fallback
                  }} 
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow">
                  {p.stock > 0 ? `${p.stock} Left` : 'Out of Stock'}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs uppercase text-primary font-bold tracking-wider">{p.category}</div>
                <h3 className="font-bold text-xl mt-1 text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">{p.description}</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">₹{p.price}</div>
                    <div className="text-xs text-muted-foreground">per {p.unit}</div>
                  </div>
                  {p.seller_id === userId ? (
                    <span className="text-xs font-semibold text-primary/70 bg-primary/10 px-2 py-1 rounded-md">Your listing</span>
                  ) : (
                    <Button size="sm" className="ripple shadow-md" onClick={() => buy(p)} disabled={p.stock < 1}>
                      {p.stock < 1 ? 'Sold out' : 'Order Now'}
                    </Button>
                  )}
                </div>
                
                {/* BUY LINKS: Dynamic e-commerce links */}
                <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-2">
                  <a 
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`} 
                    target="_blank" rel="noreferrer"
                    className="flex justify-center items-center py-2 text-xs font-bold rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors"
                  >
                    Amazon <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                  <a 
                    href={`https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`} 
                    target="_blank" rel="noreferrer"
                    className="flex justify-center items-center py-2 text-xs font-bold rounded-lg bg-[#2874F0]/10 text-[#2874F0] hover:bg-[#2874F0]/20 transition-colors"
                  >
                    Flipkart <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                  <a 
                    href={`https://www.meesho.com/search?q=${encodeURIComponent(p.name)}`} 
                    target="_blank" rel="noreferrer"
                    className="flex justify-center items-center py-2 text-xs font-bold rounded-lg bg-[#F43397]/10 text-[#F43397] hover:bg-[#F43397]/20 transition-colors"
                  >
                    Meesho <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                  <a 
                    href={`https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(p.name)}`} 
                    target="_blank" rel="noreferrer"
                    className="flex justify-center items-center py-2 text-xs font-bold rounded-lg bg-[#00A699]/10 text-[#00A699] hover:bg-[#00A699]/20 transition-colors"
                  >
                    IndiaMART <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
