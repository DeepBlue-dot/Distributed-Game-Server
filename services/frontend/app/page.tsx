import Link from "next/link";
import { ArrowRight, LogIn, Play, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Live gateway sync",
    description: "Your queue, turns, and game state stay in step with the realtime websocket layer.",
    icon: Zap,
  },
  {
    title: "Fair matchmaking",
    description: "Players are paired through a dedicated queue that keeps the experience responsive and balanced.",
    icon: Users,
  },
  {
    title: "Reliable rules engine",
    description: "Every move is validated server-side before the board updates, keeping the match consistent.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="grid min-h-[calc(100vh-10rem)] content-center gap-8 py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-background to-primary/10 shadow-[0_20px_80px_-30px_hsl(var(--primary))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%)]" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Live multiplayer experience
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Play tic-tac-toe in a real-time microservice arena.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Jump into the gateway, queue for a match, and battle through a polished turn-based game flow backed by event-driven services.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start playing
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Match overview
                </p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                    <span className="text-sm">Status</span>
                    <span className="text-sm font-semibold text-emerald-500">Queue ready</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                    <span className="text-sm">Realtime channel</span>
                    <span className="text-sm font-semibold">/ws</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                    <span className="text-sm">Turn timer</span>
                    <span className="text-sm font-semibold">Live</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Every part of the experience is designed to feel fast, reactive, and easy to follow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-border/70 bg-card/70 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
