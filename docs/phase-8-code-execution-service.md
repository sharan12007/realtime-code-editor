# Phase 8 — Code Execution Service

## Implemented Scope
- Secure execution API: `POST /api/execute`.
- Input validation via Zod (`language`, `code`, `stdin`).
- Language runners for JavaScript, Python, C++, Java.
- Docker-isolated execution with strict runtime limits.
- Timeout/memory/output guards with deterministic result payload.

## Security Controls
- **Container isolation**: each execution runs in a fresh ephemeral container.
- **No network**: `--network none` prevents exfiltration and SSRF.
- **Resource limits**:
  - `--cpus 0.5`
  - `--memory <MAX_MEMORY_MB>m`
  - `--pids-limit 128`
- **Privilege reduction**:
  - `--cap-drop ALL`
  - `--security-opt no-new-privileges`
- **Filesystem hardening**:
  - `--read-only`
  - temporary writable `/tmp` via tmpfs only
  - mounted workspace only for submitted source file
- **Execution timeout** enforced service-side (`MAX_EXECUTION_TIME_MS`).
- **Output size cap** (`MAX_OUTPUT_BYTES`) to prevent memory abuse/log floods.

## API Contract
### Request
```json
{
  "language": "javascript | python | cpp | java",
  "code": "string",
  "stdin": "optional string"
}
```

### Response
```json
{
  "stdout": "string",
  "stderr": "string",
  "exitCode": 0,
  "durationMs": 123,
  "status": "success | error | timeout"
}
```

## Implemented Files
- `execution-service/src/config/env.ts`
- `execution-service/src/types/execute.ts`
- `execution-service/src/sandbox/docker-runner.ts`
- `execution-service/src/services/execution.service.ts`
- `execution-service/src/controllers/execute.controller.ts`
- `execution-service/src/utils/async-handler.ts`
- `execution-service/src/utils/error-handler.ts`
- `execution-service/src/server.ts`
- `execution-service/package.json`
- `execution-service/.env.example`
- `docker/execution-service.Dockerfile`

## Run Commands
```bash
cd execution-service
npm install
npm run dev
```

## Operational Note
When running execution-service in Docker, mount host Docker socket so `docker-cli` can start runner containers:
- `/var/run/docker.sock:/var/run/docker.sock`

(Will be fully wired in Phase 9 compose hardening.)
