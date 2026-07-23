import { Tabs } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { useAuthStore } from '../../../store/authStore';

export default function TabsLayout() {
  const isProfessional = useAuthStore((s) => s.user?.tipoPerfil === 'PROFISSIONAL');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { paddingBottom: 8, paddingTop: 8, height: 64, borderTopColor: '#F1F5F9', borderTopWidth: 1, elevation: 0, shadowColor: '#0F172A', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 14 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
      }}
    >
      <Tabs.Screen name="home" options={{
        title: 'Início',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="familia" options={{
        title: 'Família',
        href: isProfessional ? null : undefined,
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'people' : 'people-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="compartilhamento" options={{
        title: 'Compartilhar',
        href: isProfessional ? null : undefined,
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="configuracoes" options={{
        title: 'Configurações',
        headerShown: true,
        headerTitle: 'Configurações',
        headerTintColor: '#2563EB',
        headerShadowVisible: false,
        href: isProfessional ? undefined : null,
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'settings' : 'settings-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
    </Tabs>
  );
}
