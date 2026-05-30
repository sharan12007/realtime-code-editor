import { z } from 'zod';

export const createRoomSchema = z.object({
  roomName: z.string().min(3).max(120),
  roomSlug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/)
});
