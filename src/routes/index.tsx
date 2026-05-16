import { createFileRoute, Link } from "@tanstack/react-router";
import { Mountain } from "@/components/Mountain";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, Mountain as MountainIcon, Sparkles, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, profile } = useAuth();
  const ctaHref = !user ? "/signup" : profile?.onboarded ? "/dashboard" : "/onboarding";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-12 text-center">
          <p className="inline-block rounded-full border border-border bg-card/50 px-4 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Quit your bad habit. For real this time.
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-glow sm:text-7xl md:text-8xl">
            Shrink the <span className="text-primary">mountain</span><br />
            of your bad habit.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Pick the habit you want to crush. Each clean day, your mountain shrinks. Relapse, and it grows right back. It's that real.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to={ctaHref}>
              <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-glow">
                Start climbing down — free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-base">See pricing</Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto -mt-4 max-w-4xl px-6 pb-20">
          <Mountain size={1} className="animate-float" />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">Three steps. One mountain.</h2>
          <p className="mt-4 text-center text-muted-foreground">No coaches. No streaks app fatigue. Just one brutal, beautiful metaphor.</p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { i: 1, t: "Name your enemy", d: "Type the bad habit you want to quit. Smoking. Doomscrolling. Sugar. Whatever.", icon: MountainIcon },
              { i: 2, t: "Set the size", d: "How heavy is it? A small hill, a big mountain, or Everest. We calibrate the visual.", icon: Sparkles },
              { i: 3, t: "Shrink it daily", d: "One tap a day. Stay clean, the mountain shrinks. Relapse, it grows back, harder.", icon: TrendingDown },
            ].map(({ i, t, d, icon: Icon }) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-8 shadow-dramatic">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-6 text-sm font-mono text-muted-foreground">Step 0{i}</div>
                <h3 className="mt-2 text-2xl font-bold">{t}</h3>
                <p className="mt-3 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border py-24" style={{ background: "oklch(0.1 0.04 260)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">People who already moved mountains.</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { q: "I've tried every habit app. None made me actually feel my progress. This one does.", n: "Maya R.", h: "Quit smoking — Day 84" },
              { q: "Watching my Everest shrink to a tiny hill is more motivating than any streak counter.", n: "Daniel K.", h: "Quit doomscrolling — Day 41" },
              { q: "When I relapsed and the mountain grew back, I almost cried. That's the magic.", n: "Sofia L.", h: "Quit sugar — Day 127" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-8">
                <p className="text-lg italic text-foreground/90">"{t.q}"</p>
                <div className="mt-6">
                  <div className="font-semibold">{t.n}</div>
                  <div className="text-sm text-muted-foreground">{t.h}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">Start free. Go Pro when you're ready.</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <PriceCard
              title="Free"
              price="€0"
              features={["1 habit", "Basic mountain", "Streak tracking"]}
              cta={<Link to={ctaHref}><Button variant="outline" className="w-full">Start free</Button></Link>}
            />
            <PriceCard
              title="Pro"
              price="€1.99"
              suffix="/mo"
              highlight
              features={["Unlimited habits", "All milestone badges", "Full stats & insights", "Priority support"]}
              cta={<Link to="/pricing"><Button className="w-full shadow-glow">Go Pro</Button></Link>}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-hero border-t border-border py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-5xl font-bold text-glow sm:text-6xl">Today, you start shrinking it.</h2>
          <p className="mt-6 text-lg text-muted-foreground">No credit card. No nonsense. Just you vs. the mountain.</p>
          <Link to={ctaHref}>
            <Button size="lg" className="mt-10 h-14 px-10 text-base font-semibold shadow-glow">
              Create my mountain
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        UnHabit · Built for people who are done quitting on quitting.
      </footer>
    </div>
  );
}

function Nav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <MountainIcon className="h-5 w-5 text-primary" /> UnHabit
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/pricing"><Button variant="ghost" size="sm">Pricing</Button></Link>
          {user ? (
            <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function PriceCard({ title, price, suffix, features, cta, highlight }: {
  title: string; price: string; suffix?: string; features: string[]; cta: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-8 ${highlight ? "border-primary bg-card shadow-glow" : "border-border bg-card"}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold">{price}</span>
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 text-primary" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}
