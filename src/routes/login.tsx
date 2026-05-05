import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Agri-Market" }, { name: "description", content: "Sign in to your Agri-Market account." }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-[image:var(--gradient-sky)]">
      <Toaster richColors />
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-elegant)] p-8">
        <Link to="/" className="flex items-center gap-2 text-primary font-display text-xl font-bold justify-center">
          <Sprout className="w-6 h-6" /> Agri-Market
        </Link>
        <h1 className="text-2xl font-bold text-center mt-4">Welcome back</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">Sign in to your account</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" /></div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
