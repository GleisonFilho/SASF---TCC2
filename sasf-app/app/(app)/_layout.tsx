import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: '#2563EB',
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#0F172A' },
        headerShadowVisible: false,
        headerBackTitle: '',
        headerStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="membro/[id]" options={{ headerShown: true, headerTitle: 'Membro' }} />
      <Stack.Screen name="membro/novo" options={{ headerShown: true, headerTitle: 'Novo Membro' }} />
      <Stack.Screen name="membro/[id]/wellness" options={{ headerShown: true, headerTitle: 'Saúde+' }} />
      <Stack.Screen name="membro/[id]/timeline" options={{ headerShown: true, headerTitle: 'Linha do Tempo' }} />
      <Stack.Screen name="membro/[id]/estatisticas" options={{ headerShown: true, headerTitle: 'Estatísticas' }} />
      <Stack.Screen name="compartilhamento/novo" options={{ headerShown: true, headerTitle: 'Novo Compartilhamento' }} />
      <Stack.Screen name="compartilhamento/[id]" options={{ headerShown: true, headerTitle: 'Detalhes' }} />
      <Stack.Screen name="paciente/[token]" options={{ headerShown: true, headerTitle: 'Paciente' }} />
      <Stack.Screen name="admin/profissionais" options={{ headerShown: true, headerTitle: 'Profissionais' }} />
      <Stack.Screen name="admin/profissional/[id]" options={{ headerShown: true, headerTitle: 'Profissional' }} />
      <Stack.Screen name="perfil/editar" options={{ headerShown: true, headerTitle: 'Editar Perfil' }} />
      <Stack.Screen name="perfil/sobre" options={{ headerShown: true, headerTitle: 'Sobre o SASF' }} />
      <Stack.Screen name="perfil/configuracoes" options={{ headerShown: true, headerTitle: 'Configurações' }} />
      <Stack.Screen name="perfil/conquistas" options={{ headerShown: true, headerTitle: 'Conquistas' }} />
      <Stack.Screen name="perfil/dispositivos" options={{ headerShown: true, headerTitle: 'Dispositivos' }} />
    </Stack>
  );
}
