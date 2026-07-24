import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { primaryShadow, dangerShadow, accentShadow } from '../../constants/shadows';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'danger-outline';
  disabled?: boolean;
}

const variantStyles: Record<string, { backgroundColor: string; borderWidth?: number; borderColor?: string }> = {
  primary: { backgroundColor: '#2563EB' },
  secondary: { backgroundColor: '#10B981' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#2563EB' },
  danger: { backgroundColor: '#DC2626' },
  'danger-outline': { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#FCA5A5' },
};

const variantShadows = {
  primary: primaryShadow,
  secondary: accentShadow,
  outline: undefined,
  danger: dangerShadow,
  'danger-outline': undefined,
};

const textColors: Record<string, string> = {
  primary: '#FFFFFF',
  secondary: '#FFFFFF',
  outline: '#2563EB',
  danger: '#FFFFFF',
  'danger-outline': '#DC2626',
};

export function Button({ title, onPress, loading, variant = 'primary', disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      className="rounded-2xl py-4 items-center justify-center"
      style={[
        variantStyles[variant],
        disabled || loading ? { opacity: 0.5 } : variantShadows[variant],
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563EB' : variant === 'danger-outline' ? '#DC2626' : '#fff'} />
      ) : (
        <Text className="text-base font-semibold" style={{ color: textColors[variant] }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
