import { View } from 'react-native';
import { Icon } from './Icon';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 72 }: LogoProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      className="bg-primary items-center justify-center shadow-md shadow-primary/30"
    >
      <Icon name="pulse" size={Math.round(size * 0.5)} color="#fff" />
    </View>
  );
}
