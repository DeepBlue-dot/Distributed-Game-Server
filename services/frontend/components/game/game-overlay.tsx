"use client";

import {
  Handshake,
  History,
  Loader2,
  Play,
  RefreshCcw,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActiveGameState, GameOverMessage } from "@/lib/types";

function formatReason(reason?: string) {
  if (!reason) return "";
  return reason.replaceAll("_", " ").toLowerCase();
}

type RatingUpdate = {
  matchId: string;
  ratingChange: number;
  newRating: number;
} | null;

type RematchState = {
  matchId: string;
  status: "idle" | "pending" | "accepted" | "expired";
  requestedBy: string;
} | null;

type OverlayUser = {
  id?: string;
} | null;

export function GameOverlay({
  game,
  gameOver,
  socketError,
  isConnected,
  sync,
  ratingUpdate,
  rematchState,
  requestRematch,
  declineRematch,
  user,
  onFindNextMatch,
  onOpenHistory,
  onReturnToHub,
}: {
  game: ActiveGameState | null;
  gameOver: GameOverMessage["data"] | null;
  socketError: string | null;
  isConnected: boolean;
  sync: () => void;
  ratingUpdate: RatingUpdate;
  rematchState: RematchState;
  requestRematch: (matchId: string) => boolean;
  declineRematch: (matchId: string) => boolean;
  user: OverlayUser;
  onFindNextMatch: () => void;
  onOpenHistory: () => void;
  onReturnToHub: () => void;
}) {
  const opponentSymbol = game?.mySymbol === "X" ? "O" : "X";

  const handleNavigate = (action: () => void) => {
    if (game?.matchId && rematchState?.status === "pending") {
      declineRematch(game.matchId);
    }
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="relative w-full max-w-md overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
        {/* Ambient Background Glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

        <CardContent className="space-y-6 pt-4 flex flex-col items-center">
          {!game ? (
            // Case: No Active Game
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground shadow-inner">
                <Swords className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">No Active Match</h2>
                <p className="text-sm text-muted-foreground">
                  Connect to the gateway or enter matchmaking to start a round.
                </p>
              </div>
              {socketError && (
                <div className="w-full rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                  {socketError}
                </div>
              )}
              <div className="w-full grid gap-2.5">
                <Button
                  onClick={onFindNextMatch}
                  className="w-full min-h-11 rounded-xl bg-primary px-4 py-3 font-semibold tracking-wide text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/95 active:scale-[0.98]"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" aria-hidden="true" />
                  Find Match
                </Button>
                <Button
                  variant="outline"
                  onClick={sync}
                  disabled={!isConnected}
                  className="w-full min-h-11 rounded-xl border-border/80 bg-muted/30 px-4 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sync State
                </Button>
                <Button
                  variant="ghost"
                  onClick={onReturnToHub}
                  className="w-full min-h-11 rounded-xl px-4 py-3 font-semibold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : gameOver ? (
            // Case: Game Over
            <>
              <div className="mx-auto animate-in zoom-in duration-300">
                {gameOver.result === "WIN" ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10 animate-bounce">
                    <span className="text-4xl font-black">{game.mySymbol}</span>
                  </div>
                ) : gameOver.result === "LOSS" ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30 text-destructive shadow-lg shadow-destructive/10">
                    <span className="text-4xl font-black">{opponentSymbol}</span>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                    <Handshake className="h-10 w-10 text-amber-400" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 select-none">
                  Match Complete
                </p>
                <h2 className={cn(
                  "text-4xl font-black tracking-tighter",
                  gameOver.result === "WIN" && "text-emerald-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.15)]",
                  gameOver.result === "LOSS" && "text-destructive drop-shadow-[0_2px_10px_rgba(239,68,68,0.15)]",
                  gameOver.result === "DRAW" && "text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)]"
                )}>
                  {gameOver.result}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ended by {formatReason(gameOver.reason) || "completion"}.
                </p>
              </div>

              {/* Rating Update Display */}
              <div className="w-full py-4 px-6 rounded-2xl bg-muted/30 border border-border/80 shadow-inner flex flex-col items-center justify-center gap-1">
                <p className="text-xs text-muted-foreground font-semibold">Rating Update</p>
                {ratingUpdate ? (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base text-muted-foreground/80 select-none">
                      {ratingUpdate.newRating - ratingUpdate.ratingChange}
                    </span>
                    <span className="text-xs text-muted-foreground/40">→</span>
                    <span className="font-mono text-lg font-black text-foreground">
                      {ratingUpdate.newRating}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold font-mono shadow-sm",
                      ratingUpdate.ratingChange > 0 && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
                      ratingUpdate.ratingChange < 0 && "bg-destructive/10 border border-destructive/20 text-destructive",
                      ratingUpdate.ratingChange === 0 && "bg-muted border border-border text-muted-foreground"
                    )}>
                      {ratingUpdate.ratingChange >= 0 ? "+" : ""}{ratingUpdate.ratingChange}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground select-none animate-pulse">
                      Calculating rating change...
                    </span>
                  </div>
                )}
              </div>

              {/* Rematch Offer Section */}
              {game && (
                <div className="w-full border border-border bg-muted/20 rounded-2xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground select-none">Rematch Offer</p>
                  {(!rematchState || rematchState.status === "idle") ? (
                    <Button
                      onClick={() => requestRematch(game.matchId)}
                      disabled={!isConnected}
                      className="w-full min-h-10 rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                      Request Rematch
                    </Button>
                  ) : rematchState.status === "pending" ? (
                    rematchState.requestedBy === user?.id ? (
                      <Button
                        disabled
                        className="w-full min-h-10 rounded-xl bg-muted px-4 py-2 font-semibold text-muted-foreground cursor-not-allowed"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Waiting for opponent...
                      </Button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => requestRematch(game.matchId)}
                          className="flex-1 min-h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => declineRematch(game.matchId)}
                          className="flex-1 min-h-10 rounded-xl border-destructive text-destructive hover:bg-destructive/10 font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Decline
                        </Button>
                      </div>
                    )
                  ) : rematchState.status === "expired" ? (
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-sm font-medium text-destructive">
                        Rematch request expired or declined
                      </p>
                      <Button
                        onClick={() => requestRematch(game.matchId)}
                        disabled={!isConnected}
                        className="w-full min-h-10 rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Request Rematch Again
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="w-full grid gap-2.5">
                <Button
                  onClick={() => handleNavigate(onFindNextMatch)}
                  className="w-full min-h-11 rounded-xl bg-primary px-4 py-3 font-semibold tracking-wide text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/95 active:scale-[0.98]"
                >
                  Next Match
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNavigate(onOpenHistory)}
                  className="w-full min-h-11 rounded-xl border-border/80 bg-muted/30 px-4 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50 active:scale-[0.98]"
                >
                  <History className="mr-2 h-4 w-4" aria-hidden="true" />
                  View Match Details
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate(onReturnToHub)}
                  className="w-full min-h-11 rounded-xl px-4 py-3 font-semibold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
                >
                  Back to Dashboard
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
