import type { RoomUser } from '../../interfaces/socket/index.js';

type RoomState = {
  usersBySocketId: Map<string, RoomUser>;
};

const roomStateStore = new Map<string, RoomState>();

const ensureRoomState = (roomId: string): RoomState => {
  const existing = roomStateStore.get(roomId);
  if (existing) return existing;

  const state: RoomState = { usersBySocketId: new Map() };
  roomStateStore.set(roomId, state);
  return state;
};

export const addRoomUser = (roomId: string, socketId: string, user: RoomUser) => {
  const state = ensureRoomState(roomId);
  state.usersBySocketId.set(socketId, user);
};

export const removeRoomUser = (roomId: string, socketId: string) => {
  const state = roomStateStore.get(roomId);
  if (!state) return;

  state.usersBySocketId.delete(socketId);

  if (state.usersBySocketId.size === 0) {
    roomStateStore.delete(roomId);
  }
};

export const getRoomUsers = (roomId: string): RoomUser[] => {
  return Array.from(roomStateStore.get(roomId)?.usersBySocketId.values() ?? []);
};

export const getRoomIdsForSocket = (socketId: string): string[] => {
  const roomIds: string[] = [];

  for (const [roomId, state] of roomStateStore.entries()) {
    if (state.usersBySocketId.has(socketId)) {
      roomIds.push(roomId);
    }
  }

  return roomIds;
};

export const getUserBySocketInRoom = (roomId: string, socketId: string) => {
  return roomStateStore.get(roomId)?.usersBySocketId.get(socketId);
};
