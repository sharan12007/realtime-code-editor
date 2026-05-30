export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export type RoomUser = {
  userId: string;
  username: string;
  color: string;
  joinedAt: number;
};

export type CursorPayload = {
  roomId: string;
  userId: string;
  username: string;
  color: string;
  position: { lineNumber: number; column: number };
};

export type ExecutionResultPayload = {
  roomId: string;
  language: SupportedLanguage;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'success' | 'error' | 'timeout';
};

export type ClientToServerEvents = {
  'join-room': (payload: { roomId: string }, ack?: (response: { ok: boolean; message?: string }) => void) => void;
  'leave-room': (payload: { roomId: string }) => void;
  'code-change': (payload: { roomId: string; update: number[] }) => void;
  'cursor-change': (payload: CursorPayload) => void;
  'typing-start': (payload: { roomId: string; userId: string; username: string }) => void;
  'typing-stop': (payload: { roomId: string; userId: string; username: string }) => void;
  'run-code': (payload: { roomId: string; language: SupportedLanguage; code: string; stdin?: string }) => void;
};

export type ServerToClientEvents = {
  'room-users': (payload: { roomId: string; users: RoomUser[] }) => void;
  'code-updated': (payload: { roomId: string; update: number[]; fromUserId: string }) => void;
  'cursor-updated': (payload: CursorPayload) => void;
  'user-joined': (payload: { roomId: string; user: RoomUser }) => void;
  'user-left': (payload: { roomId: string; userId: string }) => void;
  'typing-started': (payload: { roomId: string; userId: string; username: string }) => void;
  'typing-stopped': (payload: { roomId: string; userId: string; username: string }) => void;
  'execution-result': (payload: ExecutionResultPayload) => void;
  'socket-error': (payload: { code: string; message: string }) => void;
};
