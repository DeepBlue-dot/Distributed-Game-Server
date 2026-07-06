import dotenv from "dotenv";
import os from "os";
import crypto from "crypto";

dotenv.config();

/**
 * Helper to ensure critical environment variables are present.
 */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing critical environment variable: ${key}`);
  }
  return value;
};

// Unique identity for this Game Logic instance
const instanceId = 
  process.env.INSTANCE_ID ?? 
  `logic-${os.hostname()}-${crypto.randomBytes(4).toString("hex")}`;

export const config = {
  // 🆔 Service Identity
  instanceId,
  port: Number(process.env.PORT) || 3003,

  // 🗄️ Hot Storage (Active Games)
  redisUrl: required("REDIS_URL"),

  // 🗃️ Cold Storage (Match History)
  mongoUri: required("MONGO_URI"),
  mongoDbName: process.env.MONGO_DB_NAME || "tictactoe_db",

  // 📨 Messaging Bus
  rabbitmqUrl: required("RABBITMQ_URL"),
  eventsExchange: "events",
  
  // Private queue for this specific instance to receive commands
  gameLogicQueue: `logic.queue`,

  // The events this service needs to react to
  routingKeys: [
    "match.created",        // To initialize a new board
    "game.cmd.move",        // Player requesting a move
    "game.cmd.forfeit",     // Player surrendering
    "player.disconnected",  // To start reconnection grace timer
  ],

  // 🛡️ Security
  jwtSecret: required("JWT_SECRET"),

  // ⏳ Game Rules (Tunables)
  turnTimeoutSec: Number(process.env.TURN_TIMEOUT_SEC) || 100,
  
  // 🧹 Janitor Tuning
  watchdogIntervalMs: 4, // Check for timed-out matches every 2 seconds
};