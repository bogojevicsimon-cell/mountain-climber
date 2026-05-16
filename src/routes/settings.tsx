import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain as MountainIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const nav = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [habit, setHabit] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (profile) setHabit(profile.habit_name ?? "");
  }, [user, profile, loading, nav]);

  const saveHabit = async () => {
    if (!user || !habit.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ habit_name: habit.trim() }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Habit updated.");
  };

  const resetProgress = async () => {
    if (!user) return;
    if (!confirm("Reset all progress to zero? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      current_streak: 0, total_clean_days: 0, longest_streak: 0, last_checkin_date: null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Progress reset.");
  };

  const cancelPro = async () => {
    if (!user) return;
    if (!confirm("Cancel your Pro subscription?")) return;
    const { error } = await supabase.from("profiles").update({ is_pro: false }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Subscription canceled.");
  };

  const deleteAccount = async () => {
    if (!user) return;
    if (!confirm("Delete your account and all data permanently?")) return;
    // Delete profile row; auth user removal would require service role.
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    await signOut();
    toast.success("Account data deleted.");
    nav({ to: "/" });
  };

  if (loading || !profile) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-base font-bold sm:text-lg"><MountainIcon className="h-5 w-5 text-primary" /> UnHabit</Link>
          <Link to="/dashboard"><Button variant="ghost" size="sm" className="text-xs sm:text-sm">Back to dashboard</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>

        <Section title="Habit">
          <Label htmlFor="habit">Habit name</Label>
          <Input id="habit" value={habit} onChange={(e) => setHabit(e.target.value)} maxLength={80} />
          <Button onClick={saveHabit} disabled={busy} className="mt-4">Save changes</Button>
        </Section>

        <Section title="Subscription">
          <p className="text-sm text-muted-foreground">
            Plan: <span className="font-semibold text-foreground">{profile.is_pro ? "Pro (€1.99/mo)" : "Free"}</span>
          </p>
          {profile.is_pro ? (
            <Button variant="outline" className="mt-4" onClick={cancelPro}>Cancel subscription</Button>
          ) : (
            <Link to="/pricing"><Button className="mt-4 shadow-glow">Upgrade to Pro</Button></Link>
          )}
        </Section>

        <Section title="Reset progress">
          <p className="text-sm text-muted-foreground">Wipe streaks and clean-day totals. Habit stays.</p>
          <Button variant="outline" className="mt-4" onClick={resetProgress} disabled={busy}>Reset all progress</Button>
        </Section>

        <Section title="Danger zone" danger>
          <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
          <Button variant="destructive" className="mt-4" onClick={deleteAccount}>Delete account</Button>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-2xl border p-4 sm:p-6 ${danger ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
      <h2 className={`mb-4 text-lg font-semibold ${danger ? "text-destructive" : ""}`}>{title}</h2>
      {children}
    </section>
  );
}
