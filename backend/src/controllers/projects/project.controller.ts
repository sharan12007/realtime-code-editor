import { Types } from 'mongoose';
import type { Response } from 'express';
import { RoomModel } from '../../infrastructure/db/models/room.model.js';
import type { AuthenticatedRequest } from '../../interfaces/http/middlewares/auth.middleware.js';
import { updateProjectSchema } from '../../interfaces/http/validators/project.validator.js';
import { getProjectByRoom, upsertProjectByRoom } from '../../application/use-cases/projects/project.use-cases.js';

const ensureRoomAccess = async (roomId: string, userId: string) => {
  const room = await RoomModel.findOne({
    _id: roomId,
    isArchived: false,
    $or: [{ ownerId: userId }, { 'collaborators.userId': userId }]
  }).lean();

  return Boolean(room);
};

export const getProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const roomId = req.params.id;
  const userId = req.user?.sub;

  if (!roomId || !Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const hasAccess = await ensureRoomAccess(roomId, userId);
  if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

  const project = await getProjectByRoom(roomId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  return res.status(200).json({ project });
};

export const updateProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const roomId = req.params.id;
  const userId = req.user?.sub;

  if (!roomId || !Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const hasAccess = await ensureRoomAccess(roomId, userId);
  if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

  const payload = updateProjectSchema.parse(req.body);
  const project = await upsertProjectByRoom(roomId, userId, payload.language, payload.files);
  return res.status(200).json({ project });
};
