export type ApiUser = {
  id: string;
  email: string;
  username: string;
};

export type ApiRoom = {
  _id: string;
  roomName: string;
  roomSlug: string;
  ownerId: string;
  collaborators: Array<{ userId: string; role: string; joinedAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type ApiProject = {
  _id: string;
  roomId: string;
  language: 'javascript' | 'python' | 'cpp' | 'java';
  files: Array<{ path: string; content: string; isEntry?: boolean }>;
};
