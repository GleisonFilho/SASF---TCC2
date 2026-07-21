import { View, Text } from 'react-native';
import { Icon } from './Icon';
import type { Achievement } from '../../utils/achievements';

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <View className={`items-center w-24 ${achievement.desbloqueada ? '' : 'opacity-40'}`}>
      <View className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${achievement.desbloqueada ? 'bg-primary-50' : 'bg-gray-100'}`}>
        <Icon name={achievement.icone} size={28} color={achievement.desbloqueada ? '#2563EB' : '#94A3B8'} />
      </View>
      <Text className="text-xs font-semibold text-gray-700 text-center" numberOfLines={2}>{achievement.titulo}</Text>
    </View>
  );
}
