import { Tabs } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { paddingBottom: 8, paddingTop: 8, height: 64, borderTopColor: '#E2E8F0', borderTopWidth: 1, elevation: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
      }}
    >
      <Tabs.Screen name="home" options={{
        title: 'Início',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="familia" options={{
        title: 'Família',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'people' : 'people-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="compartilhamento" options={{
        title: 'Compartilhar',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ focused }) => <Icon name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#2563EB' : '#94A3B8'} />,
      }} />
    </Tabs>
  );
}
