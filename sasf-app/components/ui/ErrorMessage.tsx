import { View, Text } from 'react-native';
import { Button } from './Button';
import { Icon } from './Icon';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Ocorreu um erro.', onRetry }: ErrorMessageProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-5">
      <View className="bg-danger-light w-16 h-16 rounded-2xl items-center justify-center mb-4">
        <Icon name="alert-circle-outline" size={30} color="#DC2626" />
      </View>
      <Text className="text-base text-gray-900 font-bold text-center mb-1">Algo deu errado</Text>
      <Text className="text-sm text-gray-400 text-center mb-6">{message}</Text>
      {onRetry && <Button title="Tentar novamente" onPress={onRetry} variant="outline" />}
    </View>
  );
}
