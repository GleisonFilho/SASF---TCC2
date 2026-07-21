import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, type IoniconsName } from './Icon';
import { MiniChart } from './MiniChart';

interface StatCardProps {
  icon: IoniconsName;
  iconColor?: string;
  iconBg?: string;
  title: string;
  value: string;
  subtitle?: string;
  chartData?: number[];
  chartColor?: string;
  onPress?: () => void;
}

export function StatCard({ icon, iconColor = '#2563EB', iconBg = 'bg-primary-50', title, value, subtitle, chartData, chartColor, onPress }: StatCardProps) {
  const Content = (
    <View className="bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5">
      <View className="flex-row items-center justify-between mb-3">
        <View className={`w-9 h-9 rounded-xl ${iconBg} items-center justify-center`}>
          <Icon name={icon} size={17} color={iconColor} />
        </View>
        {chartData && chartData.length >= 2 && (
          <MiniChart data={chartData} width={46} height={22} color={chartColor || iconColor} />
        )}
      </View>
      <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{value}</Text>
      <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{title}</Text>
      {subtitle && <Text className="text-[11px] text-gray-400 mt-0.5" numberOfLines={1}>{subtitle}</Text>}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flex: 1 }}>{Content}</TouchableOpacity>;
  }
  return <View style={{ flex: 1 }}>{Content}</View>;
}
