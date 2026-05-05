import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sprout, Moon, Sun, Globe } from "lucide-react";
import { LanguageCode } from "@/lib/i18n";

export function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<LanguageCode>('en');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDarkMode = savedTheme === 'dark';
    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
    
    // Language setup
    const savedLang = (localStorage.getItem('app_lang') as LanguageCode) || 'en';
    setLang(savedLang);
    window.dispatchEvent(new CustomEvent('language-changed', { detail: savedLang }));

    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LanguageCode;
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    window.dispatchEvent(new CustomEvent('language-changed', { detail: newLang }));
  };


  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Sprout className="w-6 h-6" />
          Agri-Market
        </Link>
        <nav className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm bg-secondary/50 rounded-lg px-2 py-1">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select 
              value={lang} 
              onChange={changeLanguage}
              className="bg-transparent border-none outline-none cursor-pointer text-foreground"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="te">TE</option>
              <option value="kn">KN</option>
            </select>
          </div>
          
          <button 
            onClick={toggleDark} 
            className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              <Link to="/dashboard"><Button variant="ghost" className="ripple">Dashboard</Button></Link>
              <Button variant="outline" className="ripple" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className="ripple">Sign in</Button></Link>
              <Link to="/signup"><Button className="ripple">Get started</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
