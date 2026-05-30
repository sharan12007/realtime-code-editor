import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { env } from '../config/env.js';
import type { ExecuteRequest } from '../types/execute.js';

type RunnerConfig = {
  image: string;
  sourceFile: string;
  compileCommand?: string;
  runCommand: string;
};

type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'success' | 'error' | 'timeout';
};

const languageConfig: Record<ExecuteRequest['language'], RunnerConfig> = {
  javascript: {
    image: 'node:22-alpine',
    sourceFile: 'main.js',
    runCommand: 'node /workspace/main.js'
  },
  python: {
    image: 'python:3.12-alpine',
    sourceFile: 'main.py',
    runCommand: 'python3 /workspace/main.py'
  },
  cpp: {
    image: 'gcc:14',
    sourceFile: 'main.cpp',
    compileCommand: 'g++ -O2 -std=c++20 /workspace/main.cpp -o /workspace/main',
    runCommand: '/workspace/main'
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    sourceFile: 'Main.java',
    compileCommand: 'javac /workspace/Main.java',
    runCommand: 'java -cp /workspace Main'
  }
};

const limitOutput = (value: string) => {
  if (Buffer.byteLength(value, 'utf8') <= env.maxOutputBytes) return value;
  return Buffer.from(value, 'utf8').subarray(0, env.maxOutputBytes).toString('utf8') + '\n...[truncated]';
};

const runProcess = (
  cmd: string,
  args: string[],
  timeoutMs: number,
  stdin = ''
): Promise<{ stdout: string; stderr: string; exitCode: number; timedOut: boolean }> => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (Buffer.byteLength(stdout, 'utf8') > env.maxOutputBytes * 2) {
        child.kill('SIGKILL');
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (Buffer.byteLength(stderr, 'utf8') > env.maxOutputBytes * 2) {
        child.kill('SIGKILL');
      }
    });

    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: limitOutput(stdout),
        stderr: limitOutput(stderr),
        exitCode: code ?? 1,
        timedOut
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
};

export const executeInSandbox = async (payload: ExecuteRequest): Promise<ExecutionResult> => {
  const config = languageConfig[payload.language];
  const startedAt = Date.now();
  const containerName = `collab-run-${randomUUID()}`;
  const codeB64 = Buffer.from(payload.code, 'utf8').toString('base64');

  const prepareSource = `mkdir -p /workspace && echo "$CODE_B64" | base64 -d > /workspace/${config.sourceFile}`;
  const command = config.compileCommand
    ? `${prepareSource} && ${config.compileCommand} && ${config.runCommand}`
    : `${prepareSource} && ${config.runCommand}`;

  const dockerArgs = [
    'run',
    '--name',
    containerName,
    '--rm',
    '-i',
    '--network',
    'none',
    '--cpus',
    '0.5',
    '--memory',
    `${env.maxMemoryMb}m`,
    '--pids-limit',
    '128',
    '--read-only',
    '--tmpfs',
    '/tmp:rw,noexec,nosuid,size=64m',
    '--tmpfs',
    '/workspace:rw,nosuid,size=64m',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '-e',
    `CODE_B64=${codeB64}`,
    '-w',
    '/workspace',
    config.image,
    'sh',
    '-lc',
    command
  ];

  try {
    const result = await runProcess(env.dockerBin, dockerArgs, env.maxExecutionTimeMs, payload.stdin ?? '');

    return {
      stdout: result.stdout,
      stderr: result.timedOut ? `${result.stderr}\nExecution timed out`.trim() : result.stderr,
      exitCode: result.exitCode,
      durationMs: Date.now() - startedAt,
      status: result.timedOut ? 'timeout' : result.exitCode === 0 ? 'success' : 'error'
    };
  } finally {
    await runProcess(env.dockerBin, ['rm', '-f', containerName], 2000).catch(() => undefined);
  }
};
