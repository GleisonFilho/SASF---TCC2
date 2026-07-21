import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, type IoniconsName } from '../ui/Icon';
import type { DeviceProvider } from '../../types';

export function DeviceCard({ provider, onPress }: { provider: DeviceProvider; onPress: () => void }) {
  return (
    <TouchableOpacity className="bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5 flex-row items-center" onPress={onPress} activeOpacity={0.7}>
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${provider.cor}1A` }}>
        <Icon name={provider.icone as IoniconsName} size={22} color={provider.cor} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900">{provider.nome}</Text>
        <Text className="text-xs text-gray-400">Sincronização de passos, sono e frequência cardíaca</Text>
      </View>
      <View className="bg-warning-light px-2.5 py-1 rounded-full">
        <Text className="text-warning text-xs font-bold">Em breve</Text>
      </View>
    </TouchableOpacity>
  );
}
