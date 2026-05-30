import { ProjectModel } from '../../../infrastructure/db/models/project.model.js';

export const getProjectByRoom = async (roomId: string) => {
  return ProjectModel.findOne({ roomId }).lean();
};

export const upsertProjectByRoom = async (
  roomId: string,
  userId: string,
  language: 'javascript' | 'python' | 'cpp' | 'java',
  files: Array<{ path: string; content: string; isEntry?: boolean | undefined }>
) => {
  return ProjectModel.findOneAndUpdate(
    { roomId },
    { $set: { language, files, lastEditedBy: userId } },
    { upsert: true, new: true }
  ).lean();
};
