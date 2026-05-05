import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — Agri-Market" }, { name: "description", content: "Create your Agri-Market account." }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, farm_name: farmName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Welcome to Agri-Market.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-[image:var(--gradient-sky)]">
      <Toaster richColors />
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-elegant)] p-8">
        <Link to="/" className="flex items-center gap-2 text-primary font-display text-xl font-bold justify-center">
          <Sprout className="w-6 h-6" /> Agri-Market
        </Link>
        <h1 className="text-2xl font-bold text-center mt-4">Join the harvest</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">Start selling and growing in minutes</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><Label htmlFor="name">Full name</Label><Input id="name" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1.5" /></div>
          <div><Label htmlFor="farm">Farm name</Label><Input id="farm" required value={farmName} onChange={e => setFarmName(e.target.value)} className="mt-1.5" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" /></div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
