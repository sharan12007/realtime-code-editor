import * as Y from 'yjs';
import { ProjectModel } from '../db/models/project.model.js';

type RoomDocState = {
  doc: Y.Doc;
  text: Y.Text;
  loaded: boolean;
  activeConnections: number;
};

const roomDocs = new Map<string, RoomDocState>();

const getOrCreateRoomState = (roomId: string): RoomDocState => {
  const existing = roomDocs.get(roomId);
  if (existing) return existing;

  const doc = new Y.Doc();
  const text = doc.getText('monaco');
  const created: RoomDocState = { doc, text, loaded: false, activeConnections: 0 };
  roomDocs.set(roomId, created);
  return created;
};

const ensureLoaded = async (roomId: string, state: RoomDocState) => {
  if (state.loaded) return;

  const project = await ProjectModel.findOne({ roomId }).select({ yDocState: 1, files: 1 }).lean();

  if (project?.yDocState) {
    const binary = Buffer.from(project.yDocState as unknown as Uint8Array);
    if (binary.length > 0) {
      Y.applyUpdate(state.doc, Uint8Array.from(binary));
    }
  } else if (project?.files?.length) {
    const entry = project.files.find((file) => file.isEntry) ?? project.files[0];
    if (entry?.content) {
      state.text.insert(0, entry.content);
    }
  }

  state.loaded = true;
};

export const joinRoomDoc = async (roomId: string) => {
  const state = getOrCreateRoomState(roomId);
  await ensureLoaded(roomId, state);
  state.activeConnections += 1;

  const fullState = Y.encodeStateAsUpdate(state.doc);
  return Array.from(fullState);
};

export const applyRoomUpdate = async (roomId: string, update: number[]) => {
  const state = getOrCreateRoomState(roomId);
  await ensureLoaded(roomId, state);

  Y.applyUpdate(state.doc, Uint8Array.from(update));
};

export const persistRoomDoc = async (roomId: string, userId: string) => {
  const state = roomDocs.get(roomId);
  if (!state) return;

  const encoded = Buffer.from(Y.encodeStateAsUpdate(state.doc));
  const currentText = state.text.toString();

  await ProjectModel.findOneAndUpdate(
    { roomId },
    {
      $set: {
        yDocState: encoded,
        lastEditedBy: userId,
        files: [{ path: 'main.js', content: currentText, isEntry: true }]
      }
    },
    { upsert: true, new: true }
  );
};

export const leaveRoomDoc = async (roomId: string, userId: string) => {
  const state = roomDocs.get(roomId);
  if (!state) return;

  state.activeConnections = Math.max(0, state.activeConnections - 1);

  if (state.activeConnections === 0) {
    await persistRoomDoc(roomId, userId);
    roomDocs.delete(roomId);
    state.doc.destroy();
  }
};
