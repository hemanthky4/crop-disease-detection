import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Sprout, ShoppingCart, Tractor, Calendar, Bug, FileText, Thermometer, CloudRain, MapPin, TrendingUp } from "lucide-react";
import { getTranslation, LanguageCode } from "@/lib/i18n";

type Profile = { full_name: string | null; farm_name: string | null };

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Dashboard — Agri-Market" }] }),
});

type Weather = { temp: number; condition: string; city: string };

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [lang, setLang] = useState<LanguageCode>('en');
  const threeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Language sync
    const currentLang = (localStorage.getItem('app_lang') as LanguageCode) || 'en';
    setLang(currentLang);
    const handleLang = (e: any) => setLang(e.detail);
    window.addEventListener('language-changed', handleLang);
    return () => window.removeEventListener('language-changed', handleLang);
  }, []);

  useEffect(() => {
    // Three.js CDN Injection
    if (!document.getElementById('threejs-cdn')) {
      const script = document.createElement('script');
      script.id = 'threejs-cdn';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = initThreeJS;
      document.body.appendChild(script);
    } else {
      initThreeJS();
    }

    function initThreeJS() {
      if (!window.THREE || !threeRef.current) return;
      const THREE = window.THREE as any;
      
      // Cleanup previous
      while(threeRef.current.firstChild) {
        threeRef.current.removeChild(threeRef.current.firstChild);
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(150, 150);
      threeRef.current.appendChild(renderer.domElement);

      // Create a "Crop/Leaf" representation using primitives
      const group = new THREE.Group();
      
      const leafGeo = new THREE.ConeGeometry( 0.5, 1.5, 4 );
      const leafMat = new THREE.MeshPhongMaterial({ color: 0x4ade80, flatShading: true });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 0.5;
      
      const stemGeo = new THREE.CylinderGeometry(0.1, 0.1, 1);
      const stemMat = new THREE.MeshPhongMaterial({ color: 0x22c55e });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = -0.5;
      
      group.add(leaf);
      group.add(stem);
      scene.add(group);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);
      const ambient = new THREE.AmbientLight(0x404040);
      scene.add(ambient);

      camera.position.z = 3;

      let frameId: number;
      const animate = function () {
        frameId = requestAnimationFrame(animate);
        group.rotation.y += 0.02;
        group.rotation.z = Math.sin(Date.now() * 0.002) * 0.1; // Gentle wind
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name, farm_name").eq("id", user.id).maybeSingle();
      setProfile(data);
    })();
  }, []);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const j = await r.json();
        const code = j.current?.weather_code ?? 0;
        const condition = code === 0 ? "Clear" : code < 3 ? "Partly Cloudy" : code < 50 ? "Cloudy" : code < 70 ? "Rainy" : code < 80 ? "Snow" : "Stormy";
        
        // Use BigDataCloud API for reverse geocoding
        const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then(r => r.json()).catch(() => null);
        const city = geo?.city || geo?.locality || "Location unavailable";
        
        setWeather({ temp: Math.round(j.current.temperature_2m), condition, city });
      } catch {
        setWeather({ temp: 25, condition: "Clear", city: "Location unavailable" });
      } finally {
        setLoadingWeather(false);
      }
    };

    if (!navigator.geolocation) { 
      setWeather({ temp: 0, condition: "--", city: "Geolocation not supported" });
      setLoadingWeather(false);
      return; 
    }
    
    navigator.geolocation.getCurrentPosition(
      (p) => fetchWeather(p.coords.latitude, p.coords.longitude),
      () => {
        // Handle explicit denial or timeout WITHOUT a default location
        setWeather({ temp: 0, condition: "--", city: "Location Access Denied" });
        setLoadingWeather(false);
      },
      { timeout: 10000 },
    );
  }, []);

  const features = [
    { to: "/crop-recommend", icon: Sprout, title: getTranslation(lang, 'crop_recommend'), desc: "Get suggestions for the best crops to grow" },
    { to: "/marketplace", icon: ShoppingCart, title: getTranslation(lang, 'marketplace'), desc: "Purchase insecticides, pesticides, and more" },
    { to: "/crops", icon: Tractor, title: getTranslation(lang, 'crops'), desc: "Explore various crops and their details" },
    { to: "/calendar", icon: Calendar, title: getTranslation(lang, 'calendar'), desc: "Schedule and track your farming activities" },
    { to: "/disease", icon: Bug, title: getTranslation(lang, 'disease'), desc: "Detect diseases from crop images" },
    { to: "/schemes", icon: FileText, title: getTranslation(lang, 'schemes'), desc: "Discover and apply for agricultural schemes" },
    { to: "/yield-predict", icon: TrendingUp, title: getTranslation(lang, 'yield'), desc: "AI-estimated harvest from your farm conditions" },
  ] as const;

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Welcome banner */}
      <section className="animated-gradient bg-[image:var(--gradient-hero)] text-primary-foreground py-12 px-6 text-center shadow-[var(--shadow-elegant)] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div ref={threeRef} className="w-[150px] h-[150px] drop-shadow-2xl"></div>
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              {getTranslation(lang, 'dashboard_title')}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 opacity-90 text-white/90 text-lg">
              {profile?.farm_name ?? getTranslation(lang, 'dashboard_subtitle')}
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Weather row */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glassmorphism p-6 rounded-2xl border border-border text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold"><Thermometer className="w-5 h-5" />{getTranslation(lang, 'temperature')}</div>
            {loadingWeather ? (
              <div className="mt-4 h-10 w-24 bg-muted animate-pulse rounded mx-auto"></div>
            ) : (
              <div className="mt-3 text-4xl font-bold text-primary">{weather?.temp}°C</div>
            )}
          </div>
          <div className="glassmorphism p-6 rounded-2xl border border-border text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold"><CloudRain className="w-5 h-5" />{getTranslation(lang, 'climate')}</div>
            {loadingWeather ? (
              <div className="mt-4 h-9 w-32 bg-muted animate-pulse rounded mx-auto"></div>
            ) : (
              <div className="mt-3 text-3xl font-bold text-primary">{weather?.condition}</div>
            )}
          </div>
          <div className="glassmorphism p-6 rounded-2xl border border-border text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold"><MapPin className="w-5 h-5" />{getTranslation(lang, 'location')}</div>
            {loadingWeather ? (
              <div className="mt-4 h-9 w-36 bg-muted animate-pulse rounded mx-auto"></div>
            ) : (
              <div className="mt-3 text-3xl font-bold text-primary">{weather?.city}</div>
            )}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {features.map(f => (
            <Link
              key={f.to}
              to={f.to}
              className="glassmorphism ripple group p-6 rounded-2xl border border-border text-center shadow-sm hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all block"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center group-hover:scale-110 transition-transform">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
