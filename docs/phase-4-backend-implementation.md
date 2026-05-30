# Phase 4 — Backend Implementation

## Implemented Scope
- Express app bootstrap with production security middleware.
- JWT auth + refresh token rotation + logout revocation.
- REST APIs for Auth, Rooms, and Projects.
- Mongoose-backed use-cases and controller orchestration.
- Global validation/error handling and request hardening.

## Security Decisions
- **JWT access token**: short TTL via `ACCESS_TOKEN_TTL`; sent in `Authorization` header to avoid CSRF on API auth.
- **Refresh token in HttpOnly cookie**: inaccessible to JS, reducing XSS token theft risk.
- **Refresh token rotation**: every refresh invalidates previous token (`revokedAt`, `replacedByTokenId`) to stop replay.
- **Refresh token hashing**: only SHA-256 hash stored in DB (`tokenHash`), never raw token.
- **CSRF protection**: double-submit cookie pattern for `/api/auth/refresh` using `x-csrf-token` header matching `csrf_token` cookie.
- **Helmet**: secure defaults for HTTP headers.
- **CORS allowlist**: only configured frontend origin with credentials.
- **Rate limiting**: global + stricter `/api/auth` limit to reduce brute-force risk.
- **Mongo injection mitigation**: `express-mongo-sanitize` strips dangerous query operators.
- **XSS mitigation**: request payload sanitizer strips risky tags from inputs before processing.
- **HPP mitigation**: blocks HTTP parameter pollution attacks.

## Implemented Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/rooms`
- `POST /api/rooms`
- `GET /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`

## Key Files
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/env.ts`
- `backend/src/interfaces/http/routes/*.ts`
- `backend/src/controllers/auth/auth.controller.ts`
- `backend/src/controllers/rooms/room.controller.ts`
- `backend/src/controllers/projects/project.controller.ts`
- `backend/src/application/use-cases/auth/auth.use-cases.ts`
- `backend/src/application/use-cases/rooms/room.use-cases.ts`
- `backend/src/application/use-cases/projects/project.use-cases.ts`
- `backend/src/interfaces/http/middlewares/*.ts`
- `backend/src/interfaces/http/validators/*.ts`

## Run Commands
```bash
cd backend
npm install
npm run dev
```

## Notes
- Socket.IO collaboration channel implementation is scheduled for Phase 5.
- Code execution orchestration remains in Phase 8.
