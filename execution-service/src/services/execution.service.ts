import type { ExecuteRequest } from '../types/execute.js';
import { executeInSandbox } from '../sandbox/docker-runner.js';

export const executeCode = async (payload: ExecuteRequest) => {
  return executeInSandbox(payload);
};
