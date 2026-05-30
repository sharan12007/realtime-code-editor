import { Types } from 'mongoose';
import type { Server, Socket } from 'socket.io';
import { RoomModel } from '../../../infrastructure/db/models/room.model.js';
import { runCodeViaExecutionService } from '../../../infrastructure/socket/execution.client.js';
import {
  addRoomUser,
  getRoomIdsForSocket,
  getRoomUsers,
  getUserBySocketInRoom,
  removeRoomUser
} from '../../../infrastructure/socket/presence.store.js';
import { applyRoomUpdate, joinRoomDoc, leaveRoomDoc } from '../../../infrastructure/socket/yjs-room.service.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from '../index.js';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const hasRoomAccess = async (roomId: string, userId: string) => {
  if (!Types.ObjectId.isValid(roomId)) return false;

  const room = await RoomModel.findOne({
    _id: roomId,
    isArchived: false,
    $or: [{ ownerId: userId }, { 'collaborators.userId': userId }]
  })
    .select({ _id: 1 })
    .lean();

  return Boolean(room);
};

export const registerCollaborationHandlers = (io: TypedServer, socket: TypedSocket) => {
  socket.on('join-room', async (payload, ack) => {
    const allowed = await hasRoomAccess(payload.roomId, socket.data.userId);

    if (!allowed) {
      socket.emit('socket-error', { code: 'ROOM_FORBIDDEN', message: 'You cannot join this room' });
      ack?.({ ok: false, message: 'Forbidden' });
      return;
    }

    await socket.join(payload.roomId);

    const snapshotUpdate = await joinRoomDoc(payload.roomId);
    socket.emit('code-updated', {
      roomId: payload.roomId,
      update: snapshotUpdate,
      fromUserId: 'server'
    });

    const user = {
      userId: socket.data.userId,
      username: socket.data.username,
      color: socket.data.color,
      joinedAt: Date.now()
    };

    addRoomUser(payload.roomId, socket.id, user);

    const users = getRoomUsers(payload.roomId);
    io.to(payload.roomId).emit('room-users', { roomId: payload.roomId, users });
    socket.to(payload.roomId).emit('user-joined', { roomId: payload.roomId, user });

    ack?.({ ok: true });
  });

  socket.on('leave-room', async (payload) => {
    await socket.leave(payload.roomId);
    removeRoomUser(payload.roomId, socket.id);
    await leaveRoomDoc(payload.roomId, socket.data.userId);

    io.to(payload.roomId).emit('user-left', { roomId: payload.roomId, userId: socket.data.userId });
    io.to(payload.roomId).emit('room-users', { roomId: payload.roomId, users: getRoomUsers(payload.roomId) });
  });

  socket.on('code-change', async (payload) => {
    await applyRoomUpdate(payload.roomId, payload.update);

    socket.to(payload.roomId).emit('code-updated', {
      ...payload,
      fromUserId: socket.data.userId
    });
  });

  socket.on('cursor-change', (payload) => {
    const inRoomUser = getUserBySocketInRoom(payload.roomId, socket.id);
    if (!inRoomUser) return;

    socket.to(payload.roomId).emit('cursor-updated', {
      ...payload,
      userId: socket.data.userId,
      username: socket.data.username,
      color: socket.data.color
    });
  });

  socket.on('typing-start', (payload) => {
    socket.to(payload.roomId).emit('typing-started', {
      roomId: payload.roomId,
      userId: socket.data.userId,
      username: socket.data.username
    });
  });

  socket.on('typing-stop', (payload) => {
    socket.to(payload.roomId).emit('typing-stopped', {
      roomId: payload.roomId,
      userId: socket.data.userId,
      username: socket.data.username
    });
  });

  socket.on('run-code', async (payload) => {
    const allowed = await hasRoomAccess(payload.roomId, socket.data.userId);
    if (!allowed) {
      socket.emit('socket-error', { code: 'ROOM_FORBIDDEN', message: 'Cannot execute in this room' });
      return;
    }

    try {
      const result = await runCodeViaExecutionService(payload);
      io.to(payload.roomId).emit('execution-result', {
        roomId: payload.roomId,
        language: payload.language,
        ...result
      });
    } catch {
      io.to(payload.roomId).emit('execution-result', {
        roomId: payload.roomId,
        language: payload.language,
        stdout: '',
        stderr: 'Execution service unavailable',
        exitCode: 1,
        durationMs: 0,
        status: 'error'
      });
    }
  });

  socket.on('disconnect', () => {
    const roomIds = getRoomIdsForSocket(socket.id);

    void Promise.all(
      roomIds.map(async (roomId) => {
        removeRoomUser(roomId, socket.id);
        await leaveRoomDoc(roomId, socket.data.userId);
        io.to(roomId).emit('user-left', { roomId, userId: socket.data.userId });
        io.to(roomId).emit('room-users', { roomId, users: getRoomUsers(roomId) });
      })
    );
  });
};
