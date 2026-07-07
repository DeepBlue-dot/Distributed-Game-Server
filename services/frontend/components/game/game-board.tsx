"use client";

import { cn } from "@/lib/utils";
import type { BoardCell, GameOverMessage } from "@/lib/types";

export function GameBoard({
  board,
  isMyTurn,
  gameOver,
  isConnected,
  onMakeMove,
}: {
  board: BoardCell[];
  isMyTurn: boolean;
  gameOver: GameOverMessage["data"] | null;
  isConnected: boolean;
  onMakeMove: (position: number) => void;
}) {
  return (
    <div className="grid aspect-square w-full grid-cols-3 gap-3">
      {board.map((cell, index) => {
        const disabled = !isMyTurn || !!cell || !!gameOver || !isConnected;

        return (
          <button
            key={index}
            aria-label={`Cell ${index + 1}${cell ? ` occupied by ${cell}` : ""}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border border-border bg-card text-5xl font-black transition sm:text-7xl",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !disabled && "hover:border-primary hover:bg-primary/10",
              disabled && "cursor-not-allowed",
              cell === "X" && "text-primary",
              cell === "O" && "text-accent",
            )}
            disabled={disabled}
            onClick={() => onMakeMove(index)}
          >
            {cell || <span className="text-base font-medium text-muted-foreground/30">{index + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}
