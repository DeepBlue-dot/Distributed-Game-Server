/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Loader2, Radio, RefreshCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { matchmakingApi } from "@/lib/api";
import type { QueueState } from "@/lib/types";

export function GameHubQueue({
  clearNotice,
  connectionState,
  isConnected,
  liveQueue,
  notice,
  onError,
  onLeave,
  onQueued,
  shouldJoin,
  sync,
}: {
  clearNotice: () => void;
  connectionState: string;
  isConnected: boolean;
  liveQueue?: QueueState | null;
  notice?: string | null;
  onError: (message: string | null) => void;
  onLeave: () => Promise<void>;
  onQueued: () => Promise<unknown>;
  shouldJoin: boolean;
  sync: () => boolean;
}) {
  const [joining, setJoining] = useState(false);
  const [queueStartedAt, setQueueStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (liveQueue) {
      const initialWait = liveQueue.waitTimeSeconds || 0;
      const calculatedStart = Date.now() - initialWait * 1000;
      setQueueStartedAt((prev) => {
        if (prev === null || Math.abs(prev - calculatedStart) > 2000) {
          return calculatedStart;
        }
        return prev;
      });
    }
  }, [liveQueue]);

  useEffect(() => {
    if (!queueStartedAt) {
      setElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - queueStartedAt) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [queueStartedAt]);

  useEffect(() => {
    if (!shouldJoin || !isConnected || joining || liveQueue) return;

    setJoining(true);
    onError(null);
    clearNotice();

    matchmakingApi
      .join()
      .then(async () => {
        setQueueStartedAt(Date.now());
        await onQueued();
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to join queue.";
        if (message.includes("already searching")) {
          setQueueStartedAt(Date.now());
          return;
        }
        onError(message);
      })
      .finally(() => setJoining(false));
  }, [clearNotice, isConnected, joining, liveQueue, onError, onQueued, shouldJoin]);

  return (
    <Card className="overflow-hidden border-border/80 bg-card/70">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
          {isConnected ? (
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <Radio className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <CardTitle className="text-2xl">Scanning Network</CardTitle>
        <CardDescription>
          Matchmaking is running inside the hub. Stay here and the board will replace this panel when an opponent is found.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Socket</p>
            <p className="truncate font-mono text-sm">{connectionState}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Wait</p>
            <p className="font-mono text-sm">{elapsed}s</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Position</p>
            <p className="font-mono text-sm">{liveQueue?.position ?? "..."}</p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-background/50 p-4 text-sm text-muted-foreground">
          {joining
            ? "Registering you with matchmaking..."
            : isConnected
              ? "Searching for a compatible opponent."
              : "Connecting to the websocket gateway..."}
        </div>

        {notice && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {notice}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => sync()} disabled={!isConnected}>
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Sync
        </Button>
        <Button variant="outline" onClick={() => void onLeave()}>
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Leave
        </Button>
      </CardFooter>
    </Card>
  );
}
