import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain as MountainIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/onboarding" });
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created. Let's go.");
    nav({ to: "/onboarding" });
  };

  return (
    <AuthShell title="Create your account" subtitle="One mountain. Yours to shrink.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
        </div>
        <Button type="submit" className="w-full shadow-glow" disabled={busy}>
          {busy ? "Creating..." : "Sign up"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero flex flex-col">
      <header className="border-b border-border/50 bg-background/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <MountainIcon className="h-5 w-5 text-primary" /> UnHabit
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-dramatic">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
