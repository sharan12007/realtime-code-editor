import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../types/socket';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const createSocket = (token: string) => {
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
