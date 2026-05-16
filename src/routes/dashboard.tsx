import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Mountain } from "@/components/Mountain";
import { Award, LogOut, Mountain as MountainIcon, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const MILESTONES = [7, 30, 100, 365];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function dayDiff(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

function Dashboard() {
  const nav = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [relapsing, setRelapsing] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [fxKey, setFxKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (!loading && user && profile && !profile.onboarded) nav({ to: "/onboarding" });
  }, [user, profile, loading, nav]);

  const baseSize = profile?.severity === "hill" ? 0.4 : profile?.severity === "everest" ? 1 : 0.7;
  // Mountain shrinks toward a tiny molehill as streak grows. Goal-day = 100.
  const mountainSize = useMemo(() => {
    if (!profile) return 1;
    const streak = profile.current_streak;
    const shrinkFactor = Math.min(1, streak / 100);
    return Math.max(0.08, baseSize - (baseSize - 0.08) * shrinkFactor);
  }, [profile, baseSize]);

  const alreadyCheckedToday = profile?.last_checkin_date === todayISO();

  const handleCheckin = async () => {
    if (!user || !profile) return;
    if (alreadyCheckedToday) { toast("Already checked in today. Keep going."); return; }
    setBusy(true);
    const today = todayISO();
    let newStreak = profile.current_streak + 1;
    // Reset streak if missed a day
    if (profile.last_checkin_date) {
      const gap = dayDiff(profile.last_checkin_date, today);
      if (gap > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }
    const newLongest = Math.max(profile.longest_streak, newStreak);
    const newTotal = profile.total_clean_days + 1;
    const { error } = await supabase.from("profiles").update({
      current_streak: newStreak,
      longest_streak: newLongest,
      total_clean_days: newTotal,
      last_checkin_date: today,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setFxKey((k) => k + 1);
    setShrinking(true);
    setTimeout(() => setShrinking(false), 2200);
    await refreshProfile();
    if (MILESTONES.includes(newStreak)) {
      toast.success(`🏆 ${newStreak}-day milestone unlocked!`);
    } else {
      toast.success("Clean day logged. Mountain shrinking.");
    }
  };

  const handleRelapse = async () => {
    if (!user || !profile) return;
    if (!confirm("Log a relapse? Your streak will reset to 0 and the mountain grows back.")) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      current_streak: 0,
      last_checkin_date: todayISO(),
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setFxKey((k) => k + 1);
    setRelapsing(true);
    setTimeout(() => setRelapsing(false), 1800);
    await refreshProfile();
    toast("The mountain is back. Tomorrow you start shrinking again.", { icon: "⛰️" });
  };

  if (loading || !profile) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold"><MountainIcon className="h-5 w-5 text-primary" /> UnHabit</Link>
          <div className="flex items-center gap-2">
            <Link to="/settings"><Button variant="ghost" size="sm"><SettingsIcon className="h-4 w-4" /></Button></Link>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Quitting</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{profile.habit_name}</h1>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card shadow-dramatic overflow-hidden">
          <Mountain size={mountainSize} relapsing={relapsing} shrinking={shrinking} fxKey={fxKey} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <Stat label="Current streak" value={`${profile.current_streak}`} sub="days" />
          <Stat label="Total clean" value={`${profile.total_clean_days}`} sub="days" />
          <Stat label="Longest streak" value={`${profile.longest_streak}`} sub="days" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={handleCheckin} disabled={busy || alreadyCheckedToday} className="h-16 text-base font-semibold shadow-glow">
            {alreadyCheckedToday ? "✓ Stayed clean today" : "I stayed clean today"}
          </Button>
          <Button size="lg" variant="destructive" onClick={handleRelapse} disabled={busy} className="h-16 text-base font-semibold">
            I relapsed today
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Milestones</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MILESTONES.map((m) => {
              const reached = profile.longest_streak >= m;
              return (
                <div key={m} className={`rounded-xl border p-5 text-center ${reached ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card opacity-60"}`}>
                  <Award className={`mx-auto h-7 w-7 ${reached ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="mt-2 text-xl font-bold">{m}</div>
                  <div className="text-xs text-muted-foreground">days</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-4xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
