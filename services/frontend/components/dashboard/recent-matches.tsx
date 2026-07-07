"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MatchHistoryItem } from "@/lib/types";

export function RecentMatches({
  history,
  usernames,
}: {
  history: MatchHistoryItem[];
  usernames: Record<string, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved matches yet. Finish a game and it will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((match) => (
              <div
                key={match.matchId}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-card/60 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Classic Match
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(match.endedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    vs {match.opponentId ? (usernames[match.opponentId] || "Loading...") : "unknown"} · {match.turnCount} turns
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-bold",
                    match.result === "WIN" && "bg-green-400/10 text-green-300",
                    match.result === "LOSS" && "bg-red-400/10 text-red-300",
                    match.result === "DRAW" && "bg-muted text-muted-foreground",
                  )}
                >
                  {match.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
