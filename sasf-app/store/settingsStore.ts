import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'light' | 'dark' | 'auto';

interface SettingsState {
  theme: ThemePreference;
  lembretesMedicamentos: boolean;
  resumoSemanal: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLembretesMedicamentos: (enabled: boolean) => void;
  setResumoSemanal: (enabled: boolean) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'sasf_settings';

function persist(state: Pick<SettingsState, 'theme' | 'lembretesMedicamentos' | 'resumoSemanal'>) {
  SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'auto',
  lembretesMedicamentos: false,
  resumoSemanal: false,
  isLoaded: false,

  setTheme: (theme) => {
    set({ theme });
    persist({ theme, lembretesMedicamentos: get().lembretesMedicamentos, resumoSemanal: get().resumoSemanal });
  },

  setLembretesMedicamentos: (lembretesMedicamentos) => {
    set({ lembretesMedicamentos });
    persist({ theme: get().theme, lembretesMedicamentos, resumoSemanal: get().resumoSemanal });
  },

  setResumoSemanal: (resumoSemanal) => {
    set({ resumoSemanal });
    persist({ theme: get().theme, lembretesMedicamentos: get().lembretesMedicamentos, resumoSemanal });
  },

  load: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migração do formato antigo (notificationsEnabled único) para os dois toggles novos.
        const legacyEnabled = parsed.notificationsEnabled ?? false;
        set({
          theme: parsed.theme ?? 'auto',
          lembretesMedicamentos: parsed.lembretesMedicamentos ?? legacyEnabled,
          resumoSemanal: parsed.resumoSemanal ?? legacyEnabled,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
