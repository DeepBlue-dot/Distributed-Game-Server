"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, Search, Trophy, Swords, ShieldAlert, Handshake, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { historyApi, playerApi } from "@/lib/api";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { GameResult, MatchHistoryItem, BoardCell, PublicPlayerInfo } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

function normalizeBoard(board?: BoardCell[]) {
  if (!board || board.length !== 9) return Array(9).fill("") as BoardCell[];
  return board.map((cell) => (cell === "X" || cell === "O" ? cell : "")) as BoardCell[];
}

function MiniBoard({ board }: { board: BoardCell[] }) {
  return (
    <div className="grid h-16 w-16 shrink-0 grid-cols-3 gap-0.5 rounded bg-muted/40 p-0.5 border border-border/50">
      {board.map((cell, idx) => (
        <div
          key={idx}
          className={cn(
            "flex items-center justify-center rounded bg-card text-[10px] font-black select-none",
            cell === "X" && "text-primary",
            cell === "O" && "text-accent",
          )}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { player } = useAuth();
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [result, setResult] = useState<GameResult | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opponentProfiles, setOpponentProfiles] = useState<Record<string, PublicPlayerInfo>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const opponentIds = Array.from(
      new Set(matches.map((m) => m.opponentId).filter((id): id is string => !!id))
    );
    opponentIds.forEach((id) => {
      setOpponentProfiles((prev) => {
        if (prev[id]) return prev;
        playerApi
          .publicProfile(id)
          .then((profile) => {
            setOpponentProfiles((p) => ({ ...p, [id]: profile }));
          })
          .catch((err) => {
            console.error(`Failed to fetch profile for player ${id}:`, err);
          });
        return prev;
      });
    });
  }, [matches]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);

      historyApi
        .mine({
          page,
          limit: 10,
          result: result || undefined,
          search: search || undefined,
          sortBy: "endedAt",
          order: "desc",
        })
        .then((res) => {
          setMatches(res.data);
          setTotalPages(res.totalPages || 1);
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load history."),
        )
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(handle);
  }, [page, result, search]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Match History</h1>
        <p className="text-muted-foreground mt-1">
          Review your completed games and replay moves step-by-step.
        </p>
      </div>

      {player?.stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Rating</p>
            <h3 className="mt-2 text-3xl font-black text-primary">{player.stats.rating}</h3>
            <p className="text-xs text-muted-foreground mt-1">Elo rating points</p>
            <div className="absolute right-3 top-3 opacity-15">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </Card>
          
          <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Wins</p>
            <h3 className="mt-2 text-3xl font-black text-emerald-400">{player.stats.wins}</h3>
            <p className="text-xs text-muted-foreground mt-1">{player.stats.wins} victories</p>
            <div className="absolute right-3 top-3 opacity-15">
              <Swords className="h-10 w-10 text-emerald-400" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Losses</p>
            <h3 className="mt-2 text-3xl font-black text-red-400">{player.stats.losses}</h3>
            <p className="text-xs text-muted-foreground mt-1">{player.stats.losses} defeats</p>
            <div className="absolute right-3 top-3 opacity-15">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider font-mono">Win Rate</p>
            <h3 className="mt-2 text-3xl font-black text-amber-400">
              {player.stats.wins + player.stats.losses + player.stats.draws > 0
                ? Math.round((player.stats.wins / (player.stats.wins + player.stats.losses + player.stats.draws)) * 100)
                : 0}%
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{player.stats.draws} draws recorded</p>
            <div className="absolute right-3 top-3 opacity-15">
              <Handshake className="h-10 w-10 text-amber-400" />
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9 bg-card"
            placeholder="Search by match ID or opponent ID"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border bg-card px-3 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Result filter</span>
          <select
            className="h-10 bg-transparent text-sm outline-none cursor-pointer pr-4"
            value={result}
            onChange={(event) => {
              setResult(event.target.value as GameResult | "");
              setPage(1);
            }}
          >
            <option value="">All results</option>
            <option value="WIN">Wins</option>
            <option value="LOSS">Losses</option>
            <option value="DRAW">Draws</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-md bg-muted/40" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <Card className="border-dashed bg-card/50">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No matches found matching your filters.
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.matchId} className={cn(
              "group relative overflow-hidden border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
              match.result === "WIN" && "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
              match.result === "LOSS" && "hover:border-red-500/30 hover:shadow-red-500/5",
              match.result === "DRAW" && "hover:border-amber-500/30 hover:shadow-amber-500/5"
            )}>
              <CardContent
                className="flex cursor-pointer items-center gap-4 p-4"
                onClick={() => router.push(`/history/${match.matchId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/history/${match.matchId}`);
                  }
                }}
              >
                <MiniBoard board={normalizeBoard(match.finalBoard)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-xs text-muted-foreground" title="Classic Tic-Tac-Toe">
                      Classic Match
                    </span>
                    <span className="text-xs text-muted-foreground/60 hidden sm:inline">•</span>
                    <span className="text-xs text-muted-foreground/80 font-medium">
                      {match.turnCount} turns
                    </span>
                    {match.durationMs > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground/60 hidden sm:inline">•</span>
                        <span className="text-xs text-muted-foreground/80">
                          {Math.floor(match.durationMs / 1000)}s duration
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">vs</span>
                    {match.opponentId ? (
                      <Link href={`/users/${match.opponentId}`} className="flex items-center gap-2 min-w-0">
                        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-[10px] select-none shadow-sm uppercase overflow-hidden">
                          {opponentProfiles[match.opponentId] ? (
                            <>
                              {getAvatarUrl(opponentProfiles[match.opponentId].avatarUrl) ? (
                                <Image
                                  src={getAvatarUrl(opponentProfiles[match.opponentId].avatarUrl) || ""}
                                  alt={`${opponentProfiles[match.opponentId].username}'s avatar`}
                                  width={24}
                                  height={24}
                                  className="h-full w-full object-cover animate-in fade-in duration-200"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                    const sibling = (e.target as HTMLElement).nextElementSibling;
                                    if (sibling) sibling.classList.remove("hidden");
                                  }}
                                />
                              ) : null}
                              <div
                                className={cn(
                                  "flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-accent/80 text-white select-none uppercase font-black text-[10px]",
                                  getAvatarUrl(opponentProfiles[match.opponentId].avatarUrl) ? "hidden" : ""
                                )}
                              >
                                {opponentProfiles[match.opponentId].username.charAt(0).toUpperCase()}
                              </div>
                            </>
                          ) : (
                            "?"
                          )}
                        </div>
                        <span className="font-bold text-base truncate text-foreground hover:text-primary transition-colors">
                          {opponentProfiles[match.opponentId]?.username || "Loading..."}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-[10px] select-none shadow-sm uppercase overflow-hidden">
                          ?
                        </div>
                        <span className="font-bold text-base truncate text-foreground">unknown</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {new Date(match.endedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border select-none",
                      match.result === "WIN" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                      match.result === "LOSS" && "bg-red-500/10 border-red-500/20 text-red-400",
                      match.result === "DRAW" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    )}
                  >
                    {match.result}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground select-none">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
