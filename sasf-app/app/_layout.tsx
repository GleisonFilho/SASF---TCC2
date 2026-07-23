import '../global.css';
import { useEffect } from 'react';
import { View, Text, type TextProps } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useRestoreSession } from '../hooks/useAuth';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ToastProvider } from '../components/ui/Toast';
import { notificationsService } from '../services/notifications.service';

// Fallback global de fonte: NativeWind só aplica a família via className
// explícita (`font-sans`/`font-bold`/etc). Sem isso, qualquer <Text> sem essa
// classe cairia na fonte padrão do sistema (San Francisco/Roboto) em vez de
// Plus Jakarta Sans. `defaultProps.style` só é usado quando nada mais define
// `fontFamily`, então className continua tendo prioridade normalmente.
// Guardado por uma flag para não empilhar o array de estilo a cada Fast Refresh.
const TextWithDefaults = Text as unknown as { defaultProps?: TextProps & { __sasfFontPatched?: boolean } };
if (!TextWithDefaults.defaultProps?.__sasfFontPatched) {
  TextWithDefaults.defaultProps = {
    ...TextWithDefaults.defaultProps,
    style: [{ fontFamily: 'PlusJakartaSans_400Regular' }, TextWithDefaults.defaultProps?.style],
    __sasfFontPatched: true,
  };
}

const queryClient = new QueryClient();

function AuthGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();
  const restoreSession = useRestoreSession();

  useEffect(() => {
    restoreSession();
    useSettingsStore.getState().load().then(() => {
      const { lembretesMedicamentos, resumoSemanal } = useSettingsStore.getState();
      notificationsService.syncOnBoot({ lembretesMedicamentos, resumoSemanal });
    });
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;
    const segmentsList = segments as string[];
    const inAuth = segmentsList[0] === '(auth)';
    const onPendingScreen = segmentsList[0] === '(app)' && segmentsList[1] === 'aguardando-aprovacao';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated && inAuth) {
      router.replace('/(app)/(tabs)/home');
      return;
    }
    if (isAuthenticated) {
      const isPendingProfessional = user?.tipoPerfil === 'PROFISSIONAL' && user?.profissionalDetalhe?.statusValidacao !== 'APPROVED';
      if (isPendingProfessional && !onPendingScreen) {
        router.replace('/(app)/aguardando-aprovacao');
      } else if (!isPendingProfessional && onPendingScreen) {
        router.replace('/(app)/(tabs)/home');
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  if (isLoading) return <LoadingScreen />;

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View className="flex-1">
          <StatusBar style="dark" />
          <AuthGate />
          <ToastProvider />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
