import { View, Text } from 'react-native';
import { Icon, type IoniconsName } from './Icon';

interface InfoRowProps {
  icon?: IoniconsName;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
      <View className="flex-row items-center">
        {icon && <Icon name={icon} size={14} color="#94A3B8" />}
        <Text className={`text-sm text-gray-500 ${icon ? 'ml-2' : ''}`}>{label}</Text>
      </View>
      <Text className="text-sm font-semibold text-gray-900 flex-1 text-right ml-4" numberOfLines={2}>{value}</Text>
    </View>
  );
}
