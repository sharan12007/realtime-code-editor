export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export type CursorPosition = {
  lineNumber: number;
  column: number;
};

export type CursorPayload = {
  roomId: string;
  userId: string;
  username: string;
  color: string;
  position: CursorPosition;
};

export type TypingPayload = {
  roomId: string;
  userId: string;
  username: string;
};

export type RunCodePayload = {
  roomId: string;
  language: SupportedLanguage;
  code: string;
  stdin?: string;
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

export type CodeChangePayload = {
  roomId: string;
  update: number[];
};

export type RoomUser = {
  userId: string;
  username: string;
  color: string;
  joinedAt: number;
};

export type ClientToServerEvents = {
  'join-room': (payload: { roomId: string }, ack?: (response: { ok: boolean; message?: string }) => void) => void;
  'leave-room': (payload: { roomId: string }) => void;
  'code-change': (payload: CodeChangePayload) => void;
  'cursor-change': (payload: CursorPayload) => void;
  'typing-start': (payload: TypingPayload) => void;
  'typing-stop': (payload: TypingPayload) => void;
  'run-code': (payload: RunCodePayload) => void;
};

export type ServerToClientEvents = {
  'room-users': (payload: { roomId: string; users: RoomUser[] }) => void;
  'code-updated': (payload: CodeChangePayload & { fromUserId: string }) => void;
  'cursor-updated': (payload: CursorPayload) => void;
  'user-joined': (payload: { roomId: string; user: RoomUser }) => void;
  'user-left': (payload: { roomId: string; userId: string }) => void;
  'typing-started': (payload: TypingPayload) => void;
  'typing-stopped': (payload: TypingPayload) => void;
  'execution-result': (payload: ExecutionResultPayload) => void;
  'socket-error': (payload: { code: string; message: string }) => void;
};

export type InterServerEvents = {
  ping: () => void;
};

export type SocketData = {
  userId: string;
  username: string;
  email: string;
  color: string;
};
