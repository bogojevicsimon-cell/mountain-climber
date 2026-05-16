import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [newlyEarned, setNewlyEarned] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (!loading && user && profile && !profile.onboarded) nav({ to: "/onboarding" });
  }, [user, profile, loading, nav]);

  const baseSize = profile?.severity === "hill" ? 0.4 : profile?.severity === "everest" ? 1 : 0.7;
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
      setNewlyEarned(newStreak);
      setTimeout(() => setNewlyEarned(null), 3000);
      toast.success(`${newStreak}-day milestone unlocked!`);
    } else {
      toast.success("Clean day logged. Mountain shrinking.");
    }
  };

  const handleRelapse = async () => {
    if (!user || !profile) return;
    if (!confirm("Log a relapse? Your streak will reset to 0 and the mountain grows back.")) return;
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from("profiles").update({
      current_streak: 0,
      last_checkin_date: todayISO(),
      last_relapse_at: now,
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-base sm:text-lg"><MountainIcon className="h-5 w-5 text-primary" /> UnHabit</Link>
          <div className="flex items-center gap-2">
            <Link to="/settings"><Button variant="ghost" size="sm"><SettingsIcon className="h-4 w-4" /></Button></Link>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">Quitting</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{profile.habit_name}</h1>
        </div>

        {/* Live countdown timer */}
        <CleanCountdown lastRelapseAt={profile.last_relapse_at} currentStreak={profile.current_streak} />

        {/* Mountain - bigger and more dramatic */}
        <div className="mt-6 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-20 rounded-none sm:rounded-3xl sm:border sm:border-border bg-card sm:shadow-dramatic overflow-hidden">
          <Mountain size={mountainSize} relapsing={relapsing} shrinking={shrinking} fxKey={fxKey} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          <Stat label="Current streak" value={`${profile.current_streak}`} sub="days" />
          <Stat label="Total clean" value={`${profile.total_clean_days}`} sub="days" />
          <Stat label="Longest streak" value={`${profile.longest_streak}`} sub="days" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={handleCheckin} disabled={busy || alreadyCheckedToday} className="h-14 sm:h-16 w-full text-base font-semibold shadow-glow active:scale-95 transition-transform">
            {alreadyCheckedToday ? "✓ Stayed clean today" : "I stayed clean today"}
          </Button>
          <Button size="lg" variant="destructive" onClick={handleRelapse} disabled={busy} className="h-14 sm:h-16 w-full text-base font-semibold active:scale-95 transition-transform">
            I relapsed today
          </Button>
        </div>

        <div className="mt-8 sm:mt-10">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Milestones</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            {MILESTONES.map((m) => {
              const reached = profile.longest_streak >= m;
              const justEarned = newlyEarned === m;
              return (
                <MilestoneBadge key={m} days={m} reached={reached} justEarned={justEarned} />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== Live Countdown Timer ===== */
function CleanCountdown({ lastRelapseAt, currentStreak }: { lastRelapseAt: string | null; currentStreak: number }) {
  const [time, setTime] = useState(() => computeTime(lastRelapseAt, currentStreak));

  useEffect(() => {
    const update = () => setTime(computeTime(lastRelapseAt, currentStreak));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastRelapseAt, currentStreak]);

  if (currentStreak === 0 && !lastRelapseAt) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Check in to start your clean streak</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center">
      <div className="inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-border bg-card px-4 py-3 sm:px-6 sm:py-4 shadow-glow">
        <TimeUnit value={time.d} label="DAYS" />
        <span className="text-xl sm:text-3xl font-bold text-primary/60 animate-pulse">:</span>
        <TimeUnit value={time.h} label="HRS" />
        <span className="text-xl sm:text-3xl font-bold text-primary/60 animate-pulse">:</span>
        <TimeUnit value={time.m} label="MIN" />
        <span className="text-xl sm:text-3xl font-bold text-primary/60 animate-pulse">:</span>
        <TimeUnit value={time.s} label="SEC" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[2.5rem] sm:min-w-[3.5rem]">
      <span className="text-2xl sm:text-4xl font-bold text-glow tabular-nums tracking-tight">{value}</span>
      <span className="text-[0.6rem] sm:text-xs text-muted-foreground tracking-widest">{label}</span>
    </div>
  );
}

function computeTime(lastRelapseAt: string | null, currentStreak: number) {
  let start: Date;
  if (lastRelapseAt) {
    start = new Date(lastRelapseAt);
  } else if (currentStreak > 0) {
    start = new Date();
    start.setDate(start.getDate() - currentStreak);
    start.setHours(0, 0, 0, 0);
  } else {
    return { d: "00", h: "00", m: "00", s: "00" };
  }
  const diff = Math.max(0, Date.now() - start.getTime());
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

/* ===== Milestone Badge with Gold Glow & Particle Burst ===== */
function MilestoneBadge({ days, reached, justEarned }: { days: number; reached: boolean; justEarned: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const startBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = w / 2;
    const ch = h / 2;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3;
      particles.push({
        x: cw / 2, y: ch / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        hue: 40 + Math.random() * 20,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life > p.maxLife) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        const alpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
        ctx.fill();
      }
      if (alive) animRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  useEffect(() => {
    if (justEarned) {
      startBurst();
      return () => cancelAnimationFrame(animRef.current);
    }
  }, [justEarned, startBurst]);

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 text-center overflow-hidden transition-all duration-500 ${
        reached
          ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_24px_-4px_oklch(0.8_0.16_85/0.5)]"
          : "border-border bg-card opacity-50"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <div className="relative" style={{ zIndex: 2 }}>
        <Award className={`mx-auto h-6 w-6 sm:h-7 sm:w-7 ${reached ? "text-amber-400 drop-shadow-[0_0_8px_oklch(0.85_0.16_85/0.8)]" : "text-muted-foreground"}`} />
        <div className={`mt-2 text-xl sm:text-2xl font-bold ${reached ? "text-amber-300" : ""}`}>{days}</div>
        <div className="text-xs text-muted-foreground">days</div>
      </div>
    </div>
  );
}

/* ===== Stat Card ===== */
function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 text-center">
      <div className="text-[0.6rem] sm:text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 sm:mt-2 text-2xl sm:text-4xl font-bold">{value}</div>
      <div className="text-[0.6rem] sm:text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
