"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatItem } from "@/lib/types";

function formatStatus(status?: string) {
  if (!status) return "Offline";
  if (status === "IDLE") return "online";
  return status.replaceAll("_", " ").toLowerCase();
}

export function MatchChat({
  chat,
  chatText,
  setChatText,
  canChat,
  opponentLabel,
  opponentStatus,
  opponentId,
  userId,
  onSendChat,
}: {
  chat: ChatItem[];
  chatText: string;
  setChatText: (text: string) => void;
  canChat: boolean;
  opponentLabel: string;
  opponentStatus: string;
  opponentId?: string | null;
  userId?: string;
  onSendChat: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Match Chat</h2>
          <p className="text-sm text-muted-foreground">
            {opponentId
              ? `To ${opponentLabel} (${formatStatus(opponentStatus)})`
              : "Waiting for opponent"}
          </p>
        </div>
        <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="mb-3 flex max-h-52 min-h-28 flex-col gap-2 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        {chat.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          chat.map((item) => (
            <div
              key={item.id}
              className={cn(
                "max-w-[85%] rounded-md border px-3 py-2 text-sm",
                item.from === "me" && "ml-auto border-primary/30 bg-primary/10",
                item.from === "opponent" && "mr-auto border-border bg-card",
                item.from === "system" && "mx-auto border-muted bg-muted/40 text-muted-foreground",
              )}
            >
              <p>{item.text}</p>
              <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                {item.from === "me" ? (
                  <Link href={`/users/${userId}`} className="hover:underline hover:text-primary transition-colors">You</Link>
                ) : item.from === "opponent" && opponentId ? (
                  <Link href={`/users/${opponentId}`} className="hover:underline hover:text-primary transition-colors">{opponentLabel}</Link>
                ) : (
                  "System"
                )} · {item.at}
                {item.status === "pending" ? " · sending" : ""}
                {item.status === "failed" ? " · failed" : ""}
              </p>
            </div>
          ))
        )}
      </div>

      <form className="flex gap-2" onSubmit={onSendChat}>
        <Input
          aria-label="Match chat message"
          value={chatText}
          onChange={(event) => setChatText(event.target.value)}
          placeholder={canChat ? "Message opponent..." : "Chat unavailable"}
          maxLength={240}
          disabled={!canChat}
        />
        <Button type="submit" size="sm" disabled={!canChat || !chatText.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
