import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain } from "@/components/Mountain";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

type Severity = "hill" | "mountain" | "everest";

function Onboarding() {
  const nav = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [habit, setHabit] = useState("");
  const [severity, setSeverity] = useState<Severity>("mountain");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (!loading && profile?.onboarded) nav({ to: "/dashboard" });
  }, [user, profile, loading, nav]);

  const sizeFor = (s: Severity) => s === "hill" ? 0.4 : s === "mountain" ? 0.7 : 1;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!habit.trim()) { toast.error("Tell us what habit you're quitting"); return; }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ habit_name: habit.trim(), severity, onboarded: true, current_streak: 0 })
      .eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Mountain built. Time to shrink it.");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-center text-3xl font-bold sm:text-5xl text-glow">Build your mountain</h1>
        <p className="mt-2 text-center text-sm sm:text-base text-muted-foreground">This shape will follow you every day until you crush it.</p>

        <div className="mt-8 sm:mt-10 rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-dramatic">
          <form onSubmit={submit} className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <Label htmlFor="habit" className="text-sm sm:text-base">What habit are you quitting?</Label>
              <Input id="habit" placeholder="e.g. Smoking, doomscrolling, late-night snacking..." value={habit} onChange={(e) => setHabit(e.target.value)} required maxLength={80} className="h-12 text-base" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base">How heavy is this habit?</Label>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                {([
                  { v: "hill", t: "Small Hill", d: "Annoying but light" },
                  { v: "mountain", t: "Big Mountain", d: "Real weight" },
                  { v: "everest", t: "Everest", d: "Defining struggle" },
                ] as { v: Severity; t: string; d: string }[]).map((opt) => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setSeverity(opt.v)}
                    className={`rounded-xl border p-3 sm:p-4 text-left transition-all ${
                      severity === opt.v ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="text-sm sm:text-base font-semibold">{opt.t}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{opt.d}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <Mountain size={sizeFor(severity)} />
            </div>

            <Button type="submit" size="lg" className="w-full shadow-glow" disabled={busy}>
              {busy ? "Building..." : "Start shrinking it"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
