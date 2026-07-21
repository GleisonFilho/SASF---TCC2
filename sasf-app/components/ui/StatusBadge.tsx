import { View, Text } from 'react-native';

interface StatusBadgeProps {
  label: string;
  bg: string;
  textColor: string;
  dotColor?: string;
}

export function StatusBadge({ label, bg, textColor, dotColor }: StatusBadgeProps) {
  return (
    <View className={`flex-row items-center ${bg} px-2.5 py-1 rounded-full`}>
      {dotColor && <View style={{ backgroundColor: dotColor }} className="w-1.5 h-1.5 rounded-full mr-1.5" />}
      <Text className={`text-xs font-bold ${textColor}`}>{label}</Text>
    </View>
  );
}
