import { View, Text } from 'react-native';
import { Icon } from '../ui/Icon';
import { escopoLabels, escopoIcons } from '../../utils/labels';
import type { EscopoCompartilhamento } from '../../types';

export function ScopeBadge({ escopo }: { escopo: EscopoCompartilhamento }) {
  return (
    <View className="flex-row items-center bg-primary-50 px-2.5 py-1 rounded-full mr-1.5 mb-1.5">
      <Icon name={escopoIcons[escopo] || 'ellipse-outline'} size={11} color="#2563EB" />
      <Text className="text-primary text-xs font-semibold ml-1">{escopoLabels[escopo] || escopo}</Text>
    </View>
  );
}
