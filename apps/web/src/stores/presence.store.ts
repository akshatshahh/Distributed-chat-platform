import { create } from 'zustand';
import type { PresenceStatus } from '@chat/shared-types';

interface PresenceState {
  statuses: Record<string, PresenceStatus>;
  setStatus: (userId: string, status: PresenceStatus) => void;
  setBulkStatus: (statuses: Record<string, PresenceStatus>) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  statuses: {},
  setStatus: (userId, status) =>
    set((state) => ({ statuses: { ...state.statuses, [userId]: status } })),
  setBulkStatus: (statuses) =>
    set((state) => ({ statuses: { ...state.statuses, ...statuses } })),
}));
