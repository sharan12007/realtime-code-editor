import { create } from 'zustand';
import type { RoomUser, ExecutionResultPayload, CursorPayload } from '../types/socket';
import { createSocket, disconnectSocket, getSocket } from '../services/socket/client';

type SocketState = {
  connected: boolean;
  users: RoomUser[];
  cursors: Record<string, CursorPayload>;
  typingUsers: Record<string, string>;
  executionResult: ExecutionResultPayload | null;
  connect: (token: string) => void;
  disconnect: () => void;
  bindRoomEvents: () => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  users: [],
  cursors: {},
  typingUsers: {},
  executionResult: null,
  connect: (token) => {
    const socket = createSocket(token);
    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));
  },
  disconnect: () => {
    disconnectSocket();
    set({ connected: false, users: [], cursors: {}, typingUsers: {}, executionResult: null });
  },
  bindRoomEvents: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('room-users', ({ users }) => set({ users }));
    socket.on('cursor-updated', (cursor) =>
      set((state) => ({ cursors: { ...state.cursors, [cursor.userId]: cursor } }))
    );
    socket.on('typing-started', ({ userId, username }) =>
      set((state) => ({ typingUsers: { ...state.typingUsers, [userId]: username } }))
    );
    socket.on('typing-stopped', ({ userId }) =>
      set((state) => {
        const next = { ...state.typingUsers };
        delete next[userId];
        return { typingUsers: next };
      })
    );
    socket.on('execution-result', (result) => set({ executionResult: result }));
  }
}));
