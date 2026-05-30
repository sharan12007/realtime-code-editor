# Phase 7 — Monaco + Yjs Collaboration

## Implemented Scope
- Replaced naive text broadcasting with Yjs CRDT updates.
- Added backend room-level Yjs document lifecycle manager.
- Synced initial CRDT room snapshot on join.
- Applied incremental Yjs updates across collaborators.
- Persisted CRDT snapshot (`yDocState`) and plain text fallback into `Project`.
- Bound Monaco model edits to Yjs operations (insert/delete by range offsets).

## Collaboration Flow
1. User joins room (`join-room`).
2. Backend loads room Y.Doc from Mongo (`Project.yDocState`) or fallback file content.
3. Backend sends encoded full state to joining client via `code-updated`.
4. Client applies incoming update with `Y.applyUpdate`.
5. Monaco local edits are translated to Y.Text operations.
6. Y.Doc emits binary update, client sends `code-change` delta.
7. Backend applies update to room Y.Doc and broadcasts to peers.
8. On last user leaving room, backend persists snapshot and disposes room doc.

## Backend Files
- `backend/src/infrastructure/socket/yjs-room.service.ts`
- `backend/src/interfaces/socket/handlers/collaboration.handler.ts`
- `backend/package.json`

## Frontend Files
- `frontend/src/pages/room/RoomPage.tsx`
- `frontend/package.json`

## Why This Is CRDT-Correct
- Updates are Yjs binary deltas, not whole-text overwrite messages.
- Concurrent edits converge deterministically through Yjs merge semantics.
- Server maintains authoritative in-memory Y.Doc per room lifecycle.
- Persistence stores CRDT snapshot for fast convergence on reconnect.

## Run Commands
```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd ../frontend
npm install
npm run dev
```
