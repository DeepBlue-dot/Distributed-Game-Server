/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Clock3, Flag, Handshake, Radio, RefreshCcw, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playerApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useGameSocket } from "@/hooks/useGameSocket";
import type {
  BoardCell,
  GameSymbol,
  PlayerStats,
  PublicPlayerInfo,
} from "@/lib/types";
import { GameBoard } from "@/components/game/game-board";
import { GameOverlay } from "@/components/game/game-overlay";
import { LiveFeed } from "@/components/game/live-feed";
import { MatchChat } from "@/components/game/match-chat";
import { PlayerPanel } from "@/components/game/player-panel";

const emptyBoard: BoardCell[] = Array(9).fill("") as BoardCell[];

function normalizeBoard(board?: BoardCell[]) {
  if (!board || board.length !== 9) return [...emptyBoard];
  return board.map((cell) => (cell === "X" || cell === "O" ? cell : "")) as BoardCell[];
}

function shortId(id?: string) {
  return id ? id.slice(0, 8) : "unknown";
}

function formatRecord(stats?: PlayerStats | null) {
  if (!stats) return "0W 0L 0D";
  return `${stats.wins}W ${stats.losses}L ${stats.draws}D`;
}

function formatLastOnline(value?: string | null) {
  if (!value) return "No recent activity";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent activity";

  return `Last seen ${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}`;
}

export function GameHubMatch({
  onFindNextMatch,
  onOpenHistory,
  onReturnToHub,
}: {
  onFindNextMatch: () => void;
  onOpenHistory: () => void;
  onReturnToHub: () => void;
}) {
  const { player, user } = useAuth();
  const {
    connectionState,
    error: socketError,
    isConnected,
    send,
    sync,
    liveStatus,
    liveGame: game,
    feed,
    chat,
    gameOverState: gameOver,
    ratingUpdate,
    notice,
    sendChatMessage,
    rematchState,
    requestRematch,
    declineRematch,
  } = useGameSocket(!!user);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [chatText, setChatText] = useState("");
  const [opponentInfo, setOpponentInfo] = useState<PublicPlayerInfo | null>(null);
  const opponentId = game?.opponentId ||
    game?.players.find((playerId) => playerId !== user?.id);

  useEffect(() => {
    if (!game?.expiresAt || gameOver) {
      setCountdown(null);
      return;
    }

    const update = () => {
      setCountdown(Math.max(0, Math.ceil((game.expiresAt - Date.now()) / 1000)));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [game?.expiresAt, gameOver]);

  useEffect(() => {
    if (!opponentId) {
      setOpponentInfo(null);
      return;
    }

    let cancelled = false;

    playerApi.publicProfile(opponentId)
      .then((profile) => {
        if (!cancelled) setOpponentInfo(profile);
      })
      .catch(() => {
        if (!cancelled) setOpponentInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [opponentId]);

  const board = normalizeBoard(game?.board);
  const opponentSymbol = useMemo<GameSymbol>(() => {
    return game?.mySymbol === "X" ? "O" : "X";
  }, [game?.mySymbol]);
  const isMyTurn = !!game && !!user && game.turn === user.id && !gameOver;
  const currentPlayerName = user?.username || player?.profile?.username || "You";
  const currentPlayerStats = player?.stats || null;
  const currentPlayerRating = currentPlayerStats?.rating || player?.rating || user?.rating || 1000;
  const opponentLabel = opponentInfo?.username || (opponentId ? "Opponent" : "Waiting for opponent");
  const opponentStatus = opponentInfo?.status || (game ? "IN_GAME" : "OFFLINE");
  const opponentRating = opponentInfo?.rating || opponentInfo?.stats?.rating || 1000;
  const canChat = !!game && !!opponentId && isConnected && !gameOver;
  const turnLabel = game?.turn === user?.id
    ? "You"
    : game?.turn === opponentId
      ? opponentLabel
      : game?.turn
        ? "Opponent"
        : "Waiting";
  const statusText = gameOver
    ? `Game over: ${gameOver.result.toLowerCase()}`
    : isMyTurn
      ? "Your turn"
      : game
        ? "Waiting for opponent"
        : "No active match";
  const actionHint = !isConnected
    ? "Reconnect to send moves."
    : gameOver
      ? "The match has ended."
      : isMyTurn
        ? "Choose an empty cell."
        : "Opponent is thinking.";

  function makeMove(position: number) {
    if (!game || !isMyTurn || board[position] || gameOver) return;

    send({
      type: "GAME_MOVE",
      payload: {
        matchId: game.matchId,
        move: { position },
      },
    });
  }

  function forfeit() {
    if (!game || gameOver) return;

    send({
      type: "GAME_FORFEIT",
      payload: {
        matchId: game.matchId,
      },
    });
  }

  function proposeDraw() {
    if (!game || gameOver) return;

    send({
      type: "GAME_DRAW_PROPOSE",
      payload: {
        matchId: game.matchId,
      },
    });
  }

  function confirmDraw() {
    if (!game || gameOver) return;

    send({
      type: "GAME_DRAW_CONFIRM",
      payload: {
        matchId: game.matchId,
      },
    });
  }

  function declineDraw() {
    if (!game || gameOver) return;

    send({
      type: "GAME_DRAW_DECLINE",
      payload: {
        matchId: game.matchId,
      },
    });
  }

  function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = chatText.trim();
    if (!text) return;

    const sent = sendChatMessage(text);
    if (sent) setChatText("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs",
                isConnected
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-muted bg-muted/40 text-muted-foreground",
              )}>
                <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                {connectionState}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                <Swords className="h-3.5 w-3.5" aria-hidden="true" />
                Match {game ? shortId(game.matchId) : "None"}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Tic Tac Toe</h2>
              <p className="text-muted-foreground">{statusText}. {actionHint}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => sync()} disabled={!isConnected}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Sync
            </Button>
            <Button variant="outline" onClick={forfeit} disabled={!game || !!gameOver}>
              <Flag className="h-4 w-4" aria-hidden="true" />
              Forfeit
            </Button>
            <Button
              variant="outline"
              onClick={proposeDraw}
              disabled={!game || !!gameOver || !isConnected || !!game.drawProposedBy}
            >
              <Handshake className="h-4 w-4" aria-hidden="true" />
              Propose Draw
            </Button>
          </div>
        </div>

        {game?.drawProposedBy && (
          <div className="flex animate-pulse flex-col gap-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {game.drawProposedBy === user?.id
                    ? "Draw offer pending"
                    : "Draw offered by opponent"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {game.drawProposedBy === user?.id
                    ? "Waiting for opponent response..."
                    : "Would you like to accept the draw?"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {game.drawProposedBy !== user?.id ? (
                <>
                  <Button size="sm" onClick={confirmDraw} className="bg-amber-600 text-white hover:bg-amber-700">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={declineDraw}>
                    Decline
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={declineDraw}>
                  Cancel Offer
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <PlayerPanel
            label="You"
            name={currentPlayerName}
            playerId={user?.id}
            rating={currentPlayerRating}
            record={formatRecord(currentPlayerStats)}
            status={liveStatus !== "OFFLINE" ? liveStatus : (player?.status || user?.status || "OFFLINE")}
            symbol={game?.mySymbol || "X"}
            supporting={player?.profile?.bio || "Ready in this match"}
            avatarUrl={player?.profile?.avatarUrl}
          />
          <div className="rounded-md border border-border bg-card p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Turn timer</p>
            <p className="mt-1 flex items-center justify-center gap-2 font-mono text-3xl font-bold">
              <Clock3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              {countdown === null ? "--" : `${countdown}s`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Turn: {turnLabel}</p>
          </div>
          <PlayerPanel
            align="right"
            label="Opponent"
            name={opponentLabel}
            playerId={opponentId}
            rating={opponentRating}
            record={formatRecord(opponentInfo?.stats)}
            status={opponentStatus}
            symbol={opponentSymbol}
            supporting={opponentInfo?.bio || formatLastOnline(opponentInfo?.lastOnline)}
            avatarUrl={opponentInfo?.avatarUrl}
          />
        </div>

        {(notice || socketError) && (
          <div className="rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
            {notice || socketError}
          </div>
        )}

        <GameBoard
          board={board}
          isMyTurn={isMyTurn}
          gameOver={gameOver}
          isConnected={isConnected}
          onMakeMove={makeMove}
        />
      </section>

      <aside className="flex min-w-0 flex-col gap-4">
        <MatchChat
          chat={chat}
          chatText={chatText}
          setChatText={setChatText}
          canChat={canChat}
          opponentLabel={opponentLabel}
          opponentStatus={opponentStatus}
          opponentId={opponentId}
          userId={user?.id}
          onSendChat={sendChat}
        />
        <LiveFeed feed={feed} />
      </aside>

      {(!game || gameOver) && (
        <GameOverlay
          game={game}
          gameOver={gameOver}
          socketError={socketError}
          isConnected={isConnected}
          sync={sync}
          ratingUpdate={ratingUpdate}
          rematchState={rematchState}
          requestRematch={requestRematch}
          declineRematch={declineRematch}
          user={user}
          onFindNextMatch={onFindNextMatch}
          onOpenHistory={onOpenHistory}
          onReturnToHub={onReturnToHub}
        />
      )}
    </div>
  );
}
