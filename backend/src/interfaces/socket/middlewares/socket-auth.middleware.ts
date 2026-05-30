import type { ExtendedError, Socket } from 'socket.io';
import { verifyAccessToken } from '../../../infrastructure/security/jwt.js';
import { colorFromUserId } from '../../../infrastructure/socket/cursor-color.js';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from '../index.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const socketAuthMiddleware = (
  socket: TypedSocket,
  next: (err?: ExtendedError | undefined) => void
) => {
  try {
    const authToken = socket.handshake.auth.token as string | undefined;
    const headerToken = socket.handshake.headers.authorization?.toString().startsWith('Bearer ')
      ? socket.handshake.headers.authorization.toString().slice(7)
      : undefined;

    const token = authToken ?? headerToken;

    if (!token) {
      return next(new Error('Unauthorized socket'));
    }

    const payload = verifyAccessToken(token);

    socket.data = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      color: colorFromUserId(payload.sub)
    };

    return next();
  } catch {
    return next(new Error('Invalid socket token'));
  }
};
