import { View, Text } from 'react-native';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toast';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { DeviceCard } from '../../../components/devices/DeviceCard';
import { useDeviceProviders } from '../../../hooks/useDevices';

export default function DispositivosScreen() {
  const { data: providers, isLoading } = useDeviceProviders();
  const toast = useToast();

  const handleConnect = () => {
    toast.show('Integração com dispositivos chegará em uma atualização futura.', 'info');
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <View className="items-center mb-6 mt-2 px-4">
        <View className="w-16 h-16 rounded-2xl bg-accent-light items-center justify-center mb-3">
          <Icon name="watch-outline" size={32} color="#0E7490" />
        </View>
        <Text className="text-base font-extrabold text-gray-900">Conecte seus dispositivos</Text>
        <Text className="text-sm text-gray-400 mt-1.5 text-center leading-5">
          Sincronize passos, sono, frequência cardíaca e mais para enriquecer o Health Score.
        </Text>
      </View>

      <Button title="Conectar Dispositivo" onPress={handleConnect} />

      <Text className="text-sm font-bold text-gray-900 mt-6 mb-3">Dispositivos Suportados</Text>

      {providers?.map((provider) => (
        <DeviceCard key={provider.id} provider={provider} onPress={handleConnect} />
      ))}
    </ScreenContainer>
  );
}
