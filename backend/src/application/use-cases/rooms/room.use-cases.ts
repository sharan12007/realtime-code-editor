import { Types } from 'mongoose';
import { RoomModel } from '../../../infrastructure/db/models/room.model.js';

export const listRoomsForUser = async (userId: string) => {
  return RoomModel.find({
    $or: [{ ownerId: new Types.ObjectId(userId) }, { 'collaborators.userId': new Types.ObjectId(userId) }],
    isArchived: false
  })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
};

export const createRoomForUser = async (userId: string, roomName: string, roomSlug: string) => {
  const ownerId = new Types.ObjectId(userId);
  const room = await RoomModel.create({
    roomName,
    roomSlug,
    ownerId,
    collaborators: [{ userId: ownerId, role: 'owner' }]
  });

  return room.toObject();
};

export const getRoomForUser = async (roomId: string, userId: string) => {
  return RoomModel.findOne({
    _id: roomId,
    isArchived: false,
    $or: [{ ownerId: userId }, { 'collaborators.userId': userId }]
  }).lean();
};

export const findRoomByCode = async (roomCode: string) => {
  return RoomModel.findOne({ roomSlug: roomCode.toLowerCase().trim(), isArchived: false })
    .select({ _id: 1, roomName: 1, roomSlug: 1 })
    .lean();
};

export const deleteRoomForUser = async (roomId: string, userId: string) => {
  const deleted = await RoomModel.findOneAndUpdate(
    { _id: roomId, ownerId: userId, isArchived: false },
    { $set: { isArchived: true } },
    { new: true }
  ).lean();

  return deleted;
};
