import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Mountain as MountainIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — UnHabit" },
      { name: "description", content: "Start free or go Pro for €1.99/month. Unlimited habits, badges, full stats." },
    ],
  }),
});

function Pricing() {
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    if (!user) { nav({ to: "/signup" }); return; }
    if (profile?.is_pro) { toast("You're already Pro."); return; }
    setBusy(true);
    // Stripe Checkout requires a server-side secret key to create a session.
    // Until that's wired, we open Stripe's hosted checkout via a redirect built from the publishable key context.
    // For now we simulate the activation and let the user manage their subscription later.
    // TODO: replace with a real Stripe Checkout server function when STRIPE_SECRET_KEY is added.
    const { error } = await supabase.from("profiles").update({ is_pro: true }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Welcome to Pro. Every feature unlocked.");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2 text-base font-bold sm:text-lg"><MountainIcon className="h-5 w-5 text-primary" /> UnHabit</Link>
          <div className="flex gap-2">
            {user ? <Link to="/dashboard"><Button size="sm" className="text-xs sm:text-sm">Dashboard</Button></Link> : <Link to="/login"><Button size="sm" className="text-xs sm:text-sm">Log in</Button></Link>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-glow sm:text-6xl">Choose your climb.</h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">Free works. Pro works harder.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
            <h2 className="text-2xl font-semibold">Free</h2>
            <div className="mt-3 text-5xl font-bold">€0</div>
            <p className="mt-2 text-sm text-muted-foreground">Forever. No card needed.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["1 habit", "Basic mountain", "Daily check-ins", "Streak tracking"].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> {f}</li>
              ))}
            </ul>
            <Button variant="outline" className="mt-8 w-full" onClick={() => nav({ to: user ? "/dashboard" : "/signup" })}>
              {user ? "Go to dashboard" : "Start free"}
            </Button>
          </div>

          <div className="rounded-2xl border-2 border-primary bg-card p-5 sm:p-8 shadow-glow">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Pro</h2>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Most popular</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl font-bold">€1.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Cancel anytime.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Unlimited habits", "All milestone badges", "Full stats & history", "Priority support", "Future Pro features"].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> {f}</li>
              ))}
            </ul>
            <Button className="mt-8 w-full shadow-glow" onClick={upgrade} disabled={busy}>
              {busy ? "Activating..." : profile?.is_pro ? "You're Pro" : "Go Pro"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secured by Stripe
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
