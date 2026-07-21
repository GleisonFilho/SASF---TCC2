import { View, Text, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';

export function LoadingScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <View className="bg-primary-50 w-20 h-20 rounded-3xl items-center justify-center mb-6">
        <Icon name="heart-circle" size={44} color="#2563EB" />
      </View>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-sm text-gray-400 mt-4">Carregando...</Text>
    </View>
  );
}
