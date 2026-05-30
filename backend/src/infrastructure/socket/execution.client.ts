import axios from 'axios';
import { env } from '../../config/env.js';
import type { RunCodePayload } from '../../interfaces/socket/index.js';

type ExecutionResponse = {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'success' | 'error' | 'timeout';
};

export const runCodeViaExecutionService = async (payload: RunCodePayload): Promise<ExecutionResponse> => {
  const response = await axios.post<ExecutionResponse>(`${env.executionServiceUrl}/api/execute`, {
    language: payload.language,
    code: payload.code,
    stdin: payload.stdin ?? ''
  }, { timeout: 15000 });

  return response.data;
};
