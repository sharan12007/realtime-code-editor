export const SUPPORTED_LANGUAGES = ['javascript', 'python', 'cpp', 'java'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const ROOM_ROLES = ['owner', 'editor', 'viewer'] as const;
export type RoomRole = (typeof ROOM_ROLES)[number];
