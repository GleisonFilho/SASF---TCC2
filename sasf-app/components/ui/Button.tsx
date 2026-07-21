import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
}

const variants = {
  primary: 'bg-primary shadow-sm shadow-primary/20',
  secondary: 'bg-secondary shadow-sm shadow-secondary/20',
  outline: 'bg-transparent border-[1.5px] border-primary',
  danger: 'bg-danger shadow-sm shadow-danger/20',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
  danger: 'text-white',
};

export function Button({ title, onPress, loading, variant = 'primary', disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-2xl py-4 items-center justify-center ${variants[variant]} ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563EB' : '#fff'} />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
