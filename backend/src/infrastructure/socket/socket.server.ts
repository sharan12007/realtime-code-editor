import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from '../../interfaces/socket/index.js';
import { env } from '../../config/env.js';
import { socketAuthMiddleware } from '../../interfaces/socket/middlewares/socket-auth.middleware.js';
import { registerCollaborationHandlers } from '../../interfaces/socket/handlers/collaboration.handler.js';

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: env.frontendOrigin,
      credentials: true,
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerCollaborationHandlers(io, socket);
  });

  return io;
};
