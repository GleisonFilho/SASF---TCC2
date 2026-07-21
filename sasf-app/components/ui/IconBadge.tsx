import { View } from 'react-native';
import { Icon, type IoniconsName } from './Icon';

interface IconBadgeProps {
  icon: IoniconsName;
  color: string;
  size?: number;
}

export function IconBadge({ icon, color, size = 36 }: IconBadgeProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}1A` }}
      className="items-center justify-center"
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={color} />
    </View>
  );
}
