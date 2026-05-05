import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Bug, ArrowLeft, Upload, ExternalLink, ShoppingBag, Sprout } from "lucide-react";

export const Route = createFileRoute("/disease")({
  component: Page,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Disease Detection — Agri-Market" }] }),
});

type Result = { disease: string; confidence: string; symptoms: string; treatment: string; prevention: string };

function Page() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Inject GSAP and Three.js
  useEffect(() => {
    if (!document.getElementById('gsap-cdn')) {
      const script = document.createElement('script');
      script.id = 'gsap-cdn';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      document.body.appendChild(script);
    }
  }, []);

  // 3D Loader
  useEffect(() => {
    if (!loading || !loaderRef.current) return;
    let frameId: number;
    let renderer: any, scene: any, camera: any;

    const initLoader = () => {
      if (!window.THREE) return;
      const THREE = window.THREE as any;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(100, 100);
      loaderRef.current?.appendChild(renderer.domElement);

      const geometry = new THREE.TorusGeometry(1, 0.3, 16, 50);
      const material = new THREE.MeshPhongMaterial({ color: 0x4ade80, wireframe: true });
      const torus = new THREE.Mesh(geometry, material);
      scene.add(torus);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);
      camera.position.z = 3;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        torus.rotation.x += 0.05;
        torus.rotation.y += 0.05;
        renderer.render(scene, camera);
      };
      animate();
    };

    if (window.THREE) {
      initLoader();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = initLoader;
      document.body.appendChild(script);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (renderer && loaderRef.current) loaderRef.current.removeChild(renderer.domElement);
    };
  }, [loading]);

  // Animate result on change
  useEffect(() => {
    if (result && resultRef.current && (window as any).gsap) {
      const gsap = (window as any).gsap;
      gsap.fromTo(resultRef.current, 
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [result]);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setResult(null); setError(null);
  };

  const analyze = async () => {
    if (!preview) return;
    setLoading(true); setError(null); setResult(null);
    const { data, error } = await supabase.functions.invoke("disease-detect", { body: { imageDataUrl: preview } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if ((data as any)?.error) { setError((data as any).error); return; }
    setResult(data as Result);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><Bug className="text-primary" />Crop Disease Detection</h1>
        <p className="text-muted-foreground mt-2">Upload a photo of an affected plant — our AI identifies the likely disease and treatment.</p>

        <div className="mt-8 p-6 rounded-2xl bg-card border border-border">
          <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="Crop" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="w-10 h-10 mx-auto" />
                <p className="mt-2 font-medium">Click to upload a crop image</p>
                <p className="text-xs">JPG, PNG up to 10MB</p>
              </div>
            )}
          </label>
          <Button variant="hero" className="mt-4 w-full ripple" onClick={analyze} disabled={!preview || loading}>
            {loading ? "Analyzing image..." : "Analyze image"}
          </Button>
          
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center">
              <div ref={loaderRef} className="w-[100px] h-[100px]"></div>
              <p className="text-primary font-medium mt-2 animate-pulse">Running AI Disease Detection Model...</p>
            </div>
          )}
        </div>

        {error && <div className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {result && (
          <div ref={resultRef} className="mt-8 p-8 rounded-3xl glassmorphism border border-primary/30 space-y-5 shadow-[var(--shadow-glow)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-green-400 to-primary"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-primary drop-shadow-sm">{result.disease}</h2>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Confidence: {result.confidence}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-background/50 p-5 rounded-2xl border border-border">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Bug className="w-5 h-5 text-primary"/> Description / Symptoms</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{result.symptoms}</p>
              </div>
              <div className="bg-background/50 p-5 rounded-2xl border border-border">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Sprout className="w-5 h-5 text-primary"/> Treatment Steps</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{result.treatment}</p>
                {result.prevention && (
                  <p className="text-muted-foreground text-sm leading-relaxed mt-2 border-t border-border pt-2">
                    <strong>Prevention:</strong> {result.prevention}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Recommended Pesticides:
              </div>
              <div className="flex gap-3">
                <a 
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(result.disease + ' pesticide')}`} 
                  target="_blank" rel="noreferrer"
                  className="ripple px-4 py-2 rounded-xl bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900]/20 flex items-center gap-2 text-sm font-bold transition-colors"
                >
                  Buy on Amazon <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(result.disease + ' pesticide')}`} 
                  target="_blank" rel="noreferrer"
                  className="ripple px-4 py-2 rounded-xl bg-[#2874F0]/10 text-[#2874F0] border border-[#2874F0]/30 hover:bg-[#2874F0]/20 flex items-center gap-2 text-sm font-bold transition-colors"
                >
                  Buy on Flipkart <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
