import { View, Text } from 'react-native';
import { Icon, type IoniconsName } from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IoniconsName;
}

export function EmptyState({ title, description, icon = 'file-tray-outline' }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16">
      <View className="bg-gray-100 w-16 h-16 rounded-2xl items-center justify-center mb-4">
        <Icon name={icon} size={28} color="#94A3B8" />
      </View>
      <Text className="text-base font-bold text-gray-700">{title}</Text>
      {description && <Text className="text-sm text-gray-400 mt-2 text-center px-8">{description}</Text>}
    </View>
  );
}
