# Phase 5 — Socket.IO Architecture

## Implemented Scope
- Fully typed Socket.IO event contracts (client->server and server->client).
- JWT-authenticated socket handshake middleware.
- Room join/leave lifecycle with access control checks.
- Presence model with online users per room.
- Live code delta relay (`code-change` -> `code-updated`).
- Cursor and typing synchronization events.
- `run-code` integration with execution service and room-wide result broadcast.

## Socket Security
- Socket connection requires JWT access token via:
  - `handshake.auth.token`, or
  - `Authorization: Bearer <token>` in headers.
- Room membership is revalidated against MongoDB before:
  - joining room
  - executing code in room
- Unauthorized actions emit structured `socket-error`.

## Presence Model
- In-memory room state store tracks users by `roomId` and `socketId`.
- On join:
  - user enters room map
  - `room-users` broadcast with full active list
  - `user-joined` broadcast to peers
- On leave/disconnect:
  - user removed from room map
  - `user-left` + refreshed `room-users` broadcast

## Cursor + Typing
- Unique stable cursor color is derived from `userId` hash.
- `cursor-change` emits `cursor-updated` to peers with authoritative user identity from socket auth context.
- `typing-start`/`typing-stop` mapped to peer-safe events:
  - `typing-started`
  - `typing-stopped`

## Execution Event Flow
- Client emits `run-code` with `roomId`, `language`, `code`, optional `stdin`.
- Backend calls execution service (`POST /api/execute`).
- Result fan-out emitted to all room participants as `execution-result`.
- Execution service failure returns deterministic error payload.

## Implemented Files
- `backend/src/interfaces/socket/index.ts`
- `backend/src/interfaces/socket/middlewares/socket-auth.middleware.ts`
- `backend/src/interfaces/socket/handlers/collaboration.handler.ts`
- `backend/src/infrastructure/socket/presence.store.ts`
- `backend/src/infrastructure/socket/cursor-color.ts`
- `backend/src/infrastructure/socket/execution.client.ts`
- `backend/src/infrastructure/socket/socket.server.ts`
- `backend/src/server.ts`

## Run Commands
```bash
cd backend
npm install
npm run dev
```

## Notes
- This phase provides typed transport + presence + room security.
- Yjs transport binding (Monaco + CRDT persistence lifecycle) is Phase 7.
