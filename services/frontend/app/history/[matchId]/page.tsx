"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, 
  Clock, Swords, Calendar, Activity, User, Trophy, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { historyApi, playerApi } from "@/lib/api";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { BoardCell, MatchDetail, PublicPlayerInfo } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

function getWinningLine(board: BoardCell[]) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

export default function MatchDetailPage() {
  const router = useRouter();
  const { player } = useAuth();
  const params = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<PublicPlayerInfo | null>(null);

  useEffect(() => {
    if (!match) return;
    if (!match.players.opponent) {
      setOpponentProfile(null);
      return;
    }

    playerApi
      .publicProfile(match.players.opponent)
      .then((profile) => {
        setOpponentProfile(profile);
      })
      .catch((err) => {
        console.error("Failed to fetch opponent profile:", err);
        setOpponentProfile(null);
      });
  }, [match]);

  // Replayer state
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!params.matchId) return;

    historyApi
      .byId(params.matchId)
      .then((data) => {
        setMatch(data);
        // Default to showing the final state (last move)
        setCurrentMoveIndex(data.moves.length);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load match."),
      );
  }, [params.matchId]);

  // Dynamic board based on currentMoveIndex
  const currentBoard = useMemo(() => {
    const b: BoardCell[] = Array(9).fill("");
    if (!match) return b;
    
    // Play moves up to currentMoveIndex
    for (let i = 0; i < currentMoveIndex; i++) {
      const move = match.moves[i];
      if (move && move.position >= 0 && move.position < 9) {
        b[move.position] = move.symbol;
      }
    }
    return b;
  }, [match, currentMoveIndex]);

  // Dynamic winning line check
  const winningLine = useMemo(() => {
    return getWinningLine(currentBoard);
  }, [currentBoard]);

  // Autoplay handler
  useEffect(() => {
    if (!isPlaying || !match) return;

    if (currentMoveIndex >= match.moves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= match.moves.length - 1) {
          setIsPlaying(false);
          return match.moves.length;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, match, currentMoveIndex]);

  // Replayer helpers
  const handleStart = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentMoveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentMoveIndex((prev) => Math.min(match?.moves.length || 0, prev + 1));
  };

  const handleEnd = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(match?.moves.length || 0);
  };

  const handleTogglePlay = () => {
    if (currentMoveIndex >= (match?.moves.length || 0)) {
      setCurrentMoveIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Button variant="ghost" className="hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => router.push("/history")}>
        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
        Back to History
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!match ? (
        <div className="flex h-60 items-center justify-center">
          <p className="animate-pulse text-muted-foreground text-sm">Loading match details...</p>
        </div>
      ) : (
        <>
          {/* Header Dashboard card */}
          <Card className={cn(
            "relative overflow-hidden border border-border/80 bg-card/40 backdrop-blur p-6",
            match.result === "WIN" && "border-emerald-500/20 shadow-lg shadow-emerald-500/5",
            match.result === "LOSS" && "border-red-500/20 shadow-lg shadow-red-500/5",
            match.result === "DRAW" && "border-amber-500/20 shadow-lg shadow-amber-500/5",
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider border select-none",
                      match.result === "WIN" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                      match.result === "LOSS" && "bg-red-500/10 border-red-500/20 text-red-400",
                      match.result === "DRAW" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    )}
                  >
                    {match.result}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                    Reason: {match.reason}
                  </span>
                </div>
                <h1 className="break-all text-xl md:text-2xl font-black tracking-tight text-foreground" title="Classic Tic-Tac-Toe">
                  Match Replay
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(match.startedAt).toLocaleDateString(undefined, {
                      dateStyle: "medium"
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(match.durationMs / 1000)}s total duration
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    {match.turnCount} turns played
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">You</p>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-xs select-none shadow-sm uppercase overflow-hidden">
                    {getAvatarUrl(player?.profile?.avatarUrl) ? (
                      <img
                        src={getAvatarUrl(player?.profile?.avatarUrl) || undefined}
                        alt="Your avatar"
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
                        "flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 text-white select-none uppercase font-black w-full h-full text-[10px]",
                        getAvatarUrl(player?.profile?.avatarUrl) ? "hidden" : ""
                      )}
                    >
                      {player?.profile?.username ? player.profile.username.charAt(0).toUpperCase() : "?"}
                    </div>
                  </div>
                  <p className="text-3xl font-black text-primary select-none leading-none">{match.symbols.you}</p>
                </div>
                
                <div className="h-8 w-px bg-border" />
                
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">Opponent</p>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-xs select-none shadow-sm uppercase overflow-hidden">
                    {opponentProfile && getAvatarUrl(opponentProfile.avatarUrl) ? (
                      <img
                        src={getAvatarUrl(opponentProfile.avatarUrl) || undefined}
                        alt="Opponent's avatar"
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
                        "flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 text-white select-none uppercase font-black w-full h-full text-[10px]",
                        opponentProfile && getAvatarUrl(opponentProfile.avatarUrl) ? "hidden" : ""
                      )}
                    >
                      {opponentProfile?.username ? opponentProfile.username.charAt(0).toUpperCase() : "?"}
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-semibold truncate max-w-[100px] text-muted-foreground leading-none" title={opponentProfile?.username || "unknown"}>
                    {opponentProfile?.username || "unknown"}
                  </p>
                  <p className="text-[10px] text-accent font-black select-none leading-none">{match.symbols.opponent}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
            {/* Interactive Board Panel */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-extrabold">Interactive Replayer</CardTitle>
                  <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-mono font-bold text-muted-foreground">
                    Move {currentMoveIndex} / {match.moves.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid aspect-square grid-cols-3 gap-2 bg-muted/20 p-2 rounded-lg border border-border/30">
                  {currentBoard.map((cell, index) => {
                    const isWinning = winningLine && winningLine.includes(index);
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-center rounded-md border border-border/60 bg-card text-4xl font-black select-none transition-all duration-300",
                          cell === "X" && "text-primary",
                          cell === "O" && "text-accent",
                          isWinning && "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.03] shadow-md shadow-emerald-500/10 animate-pulse",
                        )}
                      >
                        {cell}
                      </div>
                    );
                  })}
                </div>

                {/* Media Controller Row */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleStart} disabled={currentMoveIndex === 0} title="Start">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handlePrev} disabled={currentMoveIndex === 0} title="Previous Move">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="default" className="h-9 px-4 font-bold select-none text-xs flex items-center gap-1.5" onClick={handleTogglePlay}>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> {currentMoveIndex >= match.moves.length ? "Restart" : "Auto Play"}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleNext} disabled={currentMoveIndex === match.moves.length} title="Next Move">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" className="h-9 text-xs font-semibold px-2.5" onClick={handleEnd} disabled={currentMoveIndex === match.moves.length} title="Final Board">
                      Final
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Move Timeline Log Panel */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur-sm max-h-[500px] flex flex-col">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Move Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 overflow-y-auto flex-1 scrollbar-thin">
                {match.moves.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-10">No moves recorded in this match.</p>
                ) : (
                  <div className="relative border-l-2 border-border/60 ml-3 pl-6 space-y-6">
                    {match.moves.map((move, index) => {
                      const isActive = currentMoveIndex === index + 1;
                      const isFuture = index + 1 > currentMoveIndex;
                      const row = Math.floor(move.position / 3) + 1;
                      const col = (move.position % 3) + 1;

                      return (
                        <div
                          key={`${move.at}-${move.position}-${index}`}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentMoveIndex(index + 1);
                          }}
                          className={cn(
                            "relative group flex items-start justify-between gap-4 rounded-lg border p-3 text-sm cursor-pointer transition-all duration-200 select-none",
                            isActive 
                              ? "border-primary/40 bg-primary/10 scale-[1.01] shadow-sm font-semibold"
                              : isFuture
                                ? "border-border/40 bg-muted/5 opacity-55 hover:opacity-85 hover:border-border/80"
                                : "border-border/60 bg-muted/20 hover:border-border/90 hover:bg-muted/30"
                          )}
                        >
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute -left-[31px] top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full border bg-background transition-all duration-200",
                            isActive 
                              ? "border-primary bg-primary text-white scale-110"
                              : isFuture
                                ? "border-border/50 bg-background"
                                : "border-muted-foreground/60 bg-muted-foreground/10"
                          )}>
                            <span className="text-[8px] font-black">{move.symbol}</span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground/90">
                              Move {index + 1}: <span className="font-mono text-primary">{move.symbol}</span> placed on square {move.position + 1}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground/80 font-mono truncate max-w-[280px]">
                              Grid row {row}, col {col}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-muted-foreground block">
                              {new Date(move.at).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
