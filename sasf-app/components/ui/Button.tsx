import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { primaryShadow, dangerShadow, accentShadow } from '../../constants/shadows';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'danger-outline';
  disabled?: boolean;
}

const variants = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'bg-transparent border-[1.5px] border-primary',
  danger: 'bg-danger',
  'danger-outline': 'bg-transparent border-[1.5px] border-red-300',
};

const variantShadows = {
  primary: primaryShadow,
  secondary: accentShadow,
  outline: undefined,
  danger: dangerShadow,
  'danger-outline': undefined,
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
  danger: 'text-white',
  'danger-outline': 'text-danger',
};

export function Button({ title, onPress, loading, variant = 'primary', disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-2xl py-4 items-center justify-center ${variants[variant]} ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      style={disabled || loading ? undefined : variantShadows[variant]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563EB' : variant === 'danger-outline' ? '#DC2626' : '#fff'} />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
