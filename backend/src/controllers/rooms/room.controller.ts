import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../interfaces/http/middlewares/auth.middleware.js';
import { createRoomSchema } from '../../interfaces/http/validators/room.validator.js';
import {
  createRoomForUser,
  deleteRoomForUser,
  findRoomByCode,
  getRoomForUser,
  listRoomsForUser
} from '../../application/use-cases/rooms/room.use-cases.js';

export const listRoomsController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const rooms = await listRoomsForUser(userId);
  res.status(200).json({ rooms });
};

export const createRoomController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const payload = createRoomSchema.parse(req.body);
  const room = await createRoomForUser(userId, payload.roomName, payload.roomSlug);
  res.status(201).json({ room });
};

export const getRoomController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.sub;
  const roomId = req.params.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!roomId) return res.status(400).json({ message: 'Invalid room id' });

  const room = await getRoomForUser(roomId, userId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  return res.status(200).json({ room });
};

export const getRoomByCodeController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.sub;
  const roomCode = req.params.code;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!roomCode) return res.status(400).json({ message: 'Invalid room code' });

  const room = await findRoomByCode(roomCode);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  return res.status(200).json({ room });
};

export const deleteRoomController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.sub;
  const roomId = req.params.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!roomId) return res.status(400).json({ message: 'Invalid room id' });

  const room = await deleteRoomForUser(roomId, userId);
  if (!room) return res.status(404).json({ message: 'Room not found or not owner' });
  return res.status(200).json({ room });
};
