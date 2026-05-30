import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import type { ApiRoom } from '../types/api';

type RoomState = {
  rooms: ApiRoom[];
  activeRoomId: string | null;
  loading: boolean;
  fetchRooms: () => Promise<void>;
  createRoom: (roomName: string, roomSlug: string) => Promise<ApiRoom>;
  setActiveRoom: (roomId: string | null) => void;
};

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  activeRoomId: null,
  loading: false,
  fetchRooms: async () => {
    set({ loading: true });
    const { data } = await apiClient.get('/rooms');
    set({ rooms: data.rooms, loading: false });
  },
  createRoom: async (roomName, roomSlug) => {
    const { data } = await apiClient.post('/rooms', { roomName, roomSlug });
    set((state) => ({ rooms: [data.room, ...state.rooms] }));
    return data.room;
  },
  setActiveRoom: (roomId) => set({ activeRoomId: roomId })
}));
