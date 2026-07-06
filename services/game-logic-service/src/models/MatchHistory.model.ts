import mongoose, { Schema, Document } from "mongoose";

export interface IMatchHistory extends Document {
  matchId: string;
  players: string[];
  winnerId: string | null;

  symbols: Record<string, "X" | "O">;
  firstTurn: string;

  finalBoard: string[];
  moves: {
    playerId: string;
    position: number;
    symbol: string;
    at: Date;
  }[];

  turnCount: number;

  reason: "COMPLETED" | "DRAW" | "FORFEIT" | "TIMEOUT";
  terminationBy?: string | null;

  startedAt: Date;
  endedAt: Date;
  durationMs: number;
}

const MatchHistorySchema = new Schema<IMatchHistory>({
  matchId: { type: String, required: true, unique: true },

  players: { type: [String], required: true, index: true },

  winnerId: { type: String, default: null },

  symbols: { type: Schema.Types.Mixed, required: true },
  firstTurn: { type: String, required: true },

  finalBoard: { type: [String], required: true },

  moves: [
    {
      playerId: String,
      position: Number,
      symbol: String,
      at: { type: Date, default: Date.now },
    },
  ],

  turnCount: { type: Number, required: true },

  reason: {
    type: String,
    enum: ["COMPLETED", "DRAW", "FORFEIT", "TIMEOUT"],
    required: true,
  },

  terminationBy: { type: String, default: null },

  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: Date.now },
  durationMs: { type: Number, required: true },
});


export const MatchHistory = mongoose.model<IMatchHistory>("MatchHistory", MatchHistorySchema);