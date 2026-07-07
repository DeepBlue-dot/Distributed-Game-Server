"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Swords, ShieldAlert, Handshake, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { playerApi } from "@/lib/api";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { PublicPlayerInfo } from "@/lib/types";

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IDLE: "border-primary/30 bg-primary/10 text-primary",
    QUEUED: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    IN_GAME: "border-green-400/30 bg-green-400/10 text-green-300",
    OFFLINE: "border-muted bg-muted/40 text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider select-none",
        styles[status] || styles.OFFLINE,
      )}
    >
      {status === "IDLE" ? "online" : status.replace("_", " ")}
    </span>
  );
}

export default function PlayerProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicPlayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    setLoading(true);
    setError(null);
    playerApi
      .publicProfile(params.id)
      .then((data) => setProfile(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load player profile."),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="animate-pulse text-muted-foreground text-sm">Loading player profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error || "Player profile not found."}
        </div>
      </div>
    );
  }

  const stats = profile.stats || {
    rating: profile.rating || 1000,
    wins: 0,
    losses: 0,
    draws: 0,
  };
  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Button
        variant="ghost"
        className="hover:bg-muted text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/users")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Players
      </Button>

      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border border-border/80 bg-card/40 backdrop-blur p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle with image or initials */}
          <div className="relative shrink-0">
            {getAvatarUrl(profile.avatarUrl) ? (
              <img
                src={getAvatarUrl(profile.avatarUrl) || undefined}
                alt={`${profile.username || "player"}'s avatar`}
                className="h-20 w-20 rounded-full object-cover border border-border shadow-sm animate-in fade-in duration-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                  const sibling = (e.target as HTMLElement).nextElementSibling;
                  if (sibling) sibling.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-3xl select-none shadow-md uppercase ${
                getAvatarUrl(profile.avatarUrl) ? "hidden" : ""
              }`}
            >
              {profile.username ? profile.username.charAt(0).toUpperCase() : "?"}
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {profile.username}
              </h1>
              <StatusPill status={profile.status} />
            </div>
            <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Last active: {profile.lastOnline ? new Date(profile.lastOnline).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Never"}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Dashboard Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Rating</p>
          <h3 className="mt-2 text-3xl font-black text-primary">{stats.rating}</h3>
          <p className="text-xs text-muted-foreground mt-1">Elo rating points</p>
          <div className="absolute right-3 top-3 opacity-15">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Wins</p>
          <h3 className="mt-2 text-3xl font-black text-emerald-400">{stats.wins}</h3>
          <p className="text-xs text-muted-foreground mt-1">{stats.wins} victories</p>
          <div className="absolute right-3 top-3 opacity-15">
            <Swords className="h-10 w-10 text-emerald-400" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
          <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Losses</p>
          <h3 className="mt-2 text-3xl font-black text-red-400">{stats.losses}</h3>
          <p className="text-xs text-muted-foreground mt-1">{stats.losses} defeats</p>
          <div className="absolute right-3 top-3 opacity-15">
            <ShieldAlert className="h-10 w-10 text-red-400" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
          <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Win Rate</p>
          <h3 className="mt-2 text-3xl font-black text-amber-400">{winRate}%</h3>
          <p className="text-xs text-muted-foreground mt-1">{stats.draws} draws recorded</p>
          <div className="absolute right-3 top-3 opacity-15">
            <Handshake className="h-10 w-10 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Biography Section */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Biography
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {profile.bio || "This player has not written a biography yet."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
