"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentPlayerState } from "@/lib/types";

export function LiveState({
  connectionState,
  livePlayer,
  liveOpponentUsername,
}: {
  connectionState: string;
  livePlayer: CurrentPlayerState;
  liveOpponentUsername: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const queue = livePlayer.queue;

  useEffect(() => {
    if (!queue) {
      setElapsed(0);
      return;
    }

    const initialWait = queue.waitTimeSeconds || 0;
    const start = Date.now() - initialWait * 1000;

    // Set initial value immediately
    setElapsed(initialWait);

    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [queue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" aria-hidden="true" />
          Live State
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Socket</span>
          <span className="font-mono">{connectionState}</span>
        </div>
        {livePlayer.queue && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Queue Position</span>
              <span className="font-mono">
                {livePlayer.queue.position ?? "pending"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wait Time</span>
              <span className="font-mono">{elapsed}s</span>
            </div>
          </>
        )}
        {livePlayer.game && livePlayer.game.status === "ACTIVE" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Match Type</span>
              <span className="font-semibold text-xs">Classic Match</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Opponent</span>
              <span className="font-semibold text-xs">{liveOpponentUsername}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-mono">{livePlayer.game.mySymbol}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
