import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IoniconsName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = '#2563EB' }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
