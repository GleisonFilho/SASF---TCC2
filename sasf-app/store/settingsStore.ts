import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'light' | 'dark' | 'auto';

interface SettingsState {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemePreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'sasf_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'auto',
  notificationsEnabled: true,
  isLoaded: false,

  setTheme: (theme) => {
    set({ theme });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ theme, notificationsEnabled: get().notificationsEnabled }));
  },

  setNotificationsEnabled: (notificationsEnabled) => {
    set({ notificationsEnabled });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ theme: get().theme, notificationsEnabled }));
  },

  load: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ theme: parsed.theme ?? 'auto', notificationsEnabled: parsed.notificationsEnabled ?? true, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
