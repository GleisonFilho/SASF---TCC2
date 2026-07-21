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
      <View className="bg-accent-light rounded-2xl p-4 mb-6 border border-accent/20 flex-row">
        <Icon name="flash-outline" size={18} color="#0E7490" />
        <Text className="text-sm text-accent-dark leading-5 flex-1 ml-2.5">
          Em breve você poderá sincronizar automaticamente passos, frequência cardíaca e sono
          direto do seu smartwatch ou pulseira fitness.
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
