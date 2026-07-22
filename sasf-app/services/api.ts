import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const API_PORT = 3333;
const HEALTH_TIMEOUT = 2500;

interface RetryableConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
  _urlRetry?: boolean;
}

function extractLanIp(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (!hostUri) return null;

  const ip = String(hostUri).split(':')[0];
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) ? ip : null;
}

/**
 * Monta a lista de URLs candidatas, em ordem de prioridade.
 * O IP da LAN (capturado do Metro/hostUri) pode ficar desatualizado se o DHCP
 * reatribuir o IP da máquina depois que o Expo iniciou — por isso nunca confiamos
 * em um único candidato: testamos cada um via /health e usamos o primeiro que responder.
 */
function buildCandidates(): string[] {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return [process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')];
  }

  if (Platform.OS === 'web') {
    return [`http://localhost:${API_PORT}/api`];
  }

  const candidates: string[] = [];
  const lanIp = extractLanIp();
  if (lanIp) candidates.push(`http://${lanIp}:${API_PORT}/api`);

  if (Platform.OS === 'android') {
    candidates.push(`http://10.0.2.2:${API_PORT}/api`); // Android emulator (AVD)
  }
  candidates.push(`http://localhost:${API_PORT}/api`); // iOS simulator / fallback

  return Array.from(new Set(candidates));
}

export const api = axios.create({
  baseURL: buildCandidates()[0],
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let resolvedBaseUrl: string | null = null;
let resolvingPromise: Promise<string> | null = null;

async function probe(url: string): Promise<boolean> {
  try {
    const res = await axios.get(`${url}/health`, { timeout: HEALTH_TIMEOUT });
    return res.status === 200;
  } catch {
    return false;
  }
}

/** Testa cada candidato em ordem e fixa o primeiro que responder. Resultado é cacheado. */
async function resolveBaseUrl(force = false): Promise<string> {
  if (resolvedBaseUrl && !force) return resolvedBaseUrl;
  if (resolvingPromise && !force) return resolvingPromise;

  resolvingPromise = (async () => {
    const candidates = buildCandidates();
    console.log('[API] Candidatos de conexão:', candidates);

    for (const candidate of candidates) {
      console.log(`[API] Testando: GET ${candidate}/health`);
      const ok = await probe(candidate);
      if (ok) {
        console.log(`[API] ✅ Backend respondeu em: ${candidate}`);
        resolvedBaseUrl = candidate;
        api.defaults.baseURL = candidate;
        return candidate;
      }
      console.warn(`[API] ❌ Sem resposta de: ${candidate}`);
    }

    const fallback = candidates[0];
    console.error('[API] ⚠️  Nenhum candidato respondeu ao /health. Usando fallback:', fallback);
    console.error('[API] Verifique: 1) backend rodando (npm run dev) 2) celular e PC na mesma rede 3) isolamento de cliente (AP isolation) desativado no roteador/hotspot');
    resolvedBaseUrl = fallback;
    api.defaults.baseURL = fallback;
    return fallback;
  })();

  return resolvingPromise;
}

// Inicia a resolução em background assim que o módulo carrega, para já estar
// pronta (ou quase) quando o usuário tocar em "Entrar".
resolveBaseUrl();

api.interceptors.request.use(async (config: RetryableConfig) => {
  await resolveBaseUrl();
  config.baseURL = resolvedBaseUrl ?? config.baseURL;

  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

function logRequestFailure(error: AxiosError, originalRequest?: RetryableConfig) {
  console.error('[API] ❌ Requisição falhou');
  console.error('  URL completa:', `${originalRequest?.baseURL ?? ''}${originalRequest?.url ?? ''}`);
  console.error('  Método:', originalRequest?.method);
  console.error('  Status HTTP:', error.response?.status ?? '(sem resposta do servidor)');
  console.error('  Corpo da resposta:', error.response?.data ?? '(nenhum)');
  console.error('  Código Axios:', error.code);
  console.error('  Mensagem:', error.message);
}

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ← ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // 401 -> access token expirado é esperado (expira em 15min); tenta renovar
    // uma vez em silêncio antes de tratar como falha de verdade. Só loga como
    // erro se a renovação também falhar.
    if (error.response?.status === 401 && originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;
      console.log('[API] Access token expirado, renovando sessão...');

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${resolvedBaseUrl ?? api.defaults.baseURL}/auth/refresh`, { refreshToken });

        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        console.error('[API] ❌ Falha ao renovar sessão — sessão expirada, redirecionando para login.');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    // Falha de rede (sem resposta alguma) -> provavelmente IP mudou (DHCP).
    // Força nova rodada de testes e tenta a requisição de novo, uma vez.
    if (!error.response && originalRequest && !originalRequest._urlRetry) {
      console.warn('[API] Erro de rede sem resposta — re-detectando endereço do backend...');
      originalRequest._urlRetry = true;
      const newBaseUrl = await resolveBaseUrl(true);
      originalRequest.baseURL = newBaseUrl;
      return api(originalRequest);
    }

    logRequestFailure(error, originalRequest);
    return Promise.reject(error);
  },
);
