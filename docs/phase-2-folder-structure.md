# Phase 2 — Folder Structure

## Root
- `frontend/` client app
- `backend/` api + realtime gateway
- `execution-service/` code runner microservice
- `docker/` dockerfiles and infra configs
- `docs/` architecture and ADRs

## Frontend Structure
- `src/app` application root and providers
- `src/pages` route-level pages (auth/dashboard/room/profile)
- `src/components` reusable ui and editor composition
- `src/store` Zustand stores (auth/room/socket/editor)
- `src/services` axios and socket client wrappers
- `src/routes` protected/public route setup
- `src/types` shared TS types
- `src/styles` global styles and theme tokens

## Backend Structure
- `src/domain` entities, contracts, pure rules
- `src/application` use-cases and orchestration
- `src/infrastructure` db/models/security/socket internals
- `src/interfaces/http` controllers/routes/middlewares/validators
- `src/interfaces/socket` event handlers and socket middleware
- `src/shared` errors, utilities, cross-cutting types
- `tests` unit and integration tests

## Execution Service Structure
- `src/controllers` run endpoints
- `src/services` orchestration and policy checks
- `src/sandbox` runtime/container adapters
- `src/config` env and runtime limits

## Docker Structure
- `frontend.Dockerfile`
- `backend.Dockerfile`
- `execution-service.Dockerfile`
- `nginx/default.conf`

## Commands
```bash
# from repo root
Get-ChildItem
Get-ChildItem frontend/src -Recurse
Get-ChildItem backend/src -Recurse
```
