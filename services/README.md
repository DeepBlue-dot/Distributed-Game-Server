# Services Catalog

This directory contains the individual microservices and frontend clients that compose the real-time turn-based multiplayer gaming platform.

---

## Directory Index

| Service Directory | Detailed Documentation | Primary Port | Role & Domain Boundary |
|---|---|---|---|
| **[event-service](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/event-service)** | [Service README](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/event-service/README.md) | `4000` | **WebSocket Gateway**: Stateful client TCP manager, token authentications, and event-routing gateway. |
| **[player-service](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/player-service)** | [Service README](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/player-service/README.md) | `3000` | **Player Registry**: Authority on player profiles, heartbeats, presence (online/offline), and ELO updates. |
| **[matchmaking-service](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/matchmaking-service)** | [Service README](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/matchmaking-service/README.md) | `3001` | **Matchmaker**: ELO-based matchmaking search queues with dynamic range expansions. |
| **[game-logic-service](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/game-logic-service)** | [Service README](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/game-logic-service/README.md) | `3003` | **Game Engine**: Absolute authority for Tic-Tac-Toe turn validations, timer forfeits, and match history. |
| **[frontend](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/frontend)** | [Service README](file:///home/bigblue/Projects/web/dsys402-turnbased-microservices/services/frontend/README.md) | `3000` (Local) | **Client UI**: Next.js dashboard providing player profiles, queue states, and interactive game board views. |

---

## Microservices Architecture & Interactions

All communication between these services is event-driven (using RabbitMQ exchanges) and coordinated via shared memory backends (Redis for transient hot game state and PostgreSQL/MongoDB for cold persistence).

```
                      +-------------------+
                      |   Next.js Client  |
                      +-------------------+
                         /             \
             (REST HTTP) /             \ (WebSockets)
                        v               v
                +-------------+   +-------------------+
                | NGINX Proxy |   | event-service:4000|
                +-------------+   +-------------------+
                  /    |    \               |
                 v     v     v              v
               [1]    [2]    [3]    +---------------+
                |      |      |     | RabbitMQ Bus  |
                |      |      +---->+---------------+
                |      |                   ^
                v      v                   | (Events)
  +------------------+ +------------------+ |
  |player-service:300| |matchmaking-servi| |
  +------------------+ +------------------+ |
           |                    |          v
           v                    v    +------------------+
     (PostgreSQL)            (Redis) |game-logic-service|
                                     +------------------+
                                           |
                                           v
                                       (MongoDB)

[1] Authentication, User Profiles, Stats
[2] Matchmaking Enqueue / Dequeue
[3] Match History Lookups
```

### 1. Inbound Routing (Nginx Entrypoint)
Public traffic enters via the Nginx load balancer (exposed on port `80`), which proxies target routes to internal container ports:
* `/ws` upgrade traffic -> `event-service` (port `4000`)
* `/api/player/` & `/api/auth/` -> `player-service` (port `3000`)
* `/api/matchmaking/` -> `matchmaking-service` (port `3001`)
* `/api/history/` -> `game-logic-service` (port `3003`)

### 2. Transient State (Redis)
Redis is shared between the services as a low-latency cache:
* `presence:{userId}`: authoritative user connection status and gateway instance tracking.
* `player:match_map:{userId}`: direct index link of a player to an active game match.
* `game:match:{matchId}`: active Tic-Tac-Toe boards, symbols, next turn pointers, and version hashes.
* `match:queue:ranked`: sorted matchmaking sets sorted by player ELO.

---

## Development Notes

During development, you can run individual services locally by executing the following commands inside each service subfolder:

```bash
# Navigate to the service folder
cd services/<service-name>

# Install packages
npm install

# Run in watch-mode (autoreload)
npm run dev
```

For full integrated system validation, run `docker-compose up` at the project repository root.
