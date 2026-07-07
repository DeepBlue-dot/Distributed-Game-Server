"use client";

import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/types";

export function LiveFeed({ feed }: { feed: FeedItem[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Live Feed</h2>
          <p className="text-sm text-muted-foreground">Observed in this session</p>
        </div>
        <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      {feed.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No live moves yet. Synced board state is shown without replaying unknown history.
        </div>
      ) : (
        <ol className="space-y-3">
          {feed.map((item) => (
            <li key={item.id} className="rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                {item.symbol && (
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-black",
                    item.symbol === "X"
                      ? "border-primary/30 text-primary"
                      : "border-accent/30 text-accent",
                  )}>
                    {item.symbol}
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{item.at}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
