import { TextInput, View, Text, TouchableOpacity, type TextInputProps } from 'react-native';
import { forwardRef, useState } from 'react';
import { Icon, type IoniconsName } from './Icon';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IoniconsName;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, secureTextEntry, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = !!secureTextEntry;

    const borderClass = error ? 'border-danger' : isFocused ? 'border-primary' : 'border-gray-200';
    const iconColor = error ? '#DC2626' : isFocused ? '#2563EB' : '#94A3B8';

    return (
      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</Text>
        <View className={`flex-row items-center bg-white border rounded-xl px-3.5 ${borderClass}`}>
          {icon && <Icon name={icon} size={18} color={iconColor} />}
          <TextInput
            ref={ref}
            className={`flex-1 text-base text-gray-900 py-3.5 ${icon ? 'ml-2.5' : ''}`}
            placeholderTextColor="#94A3B8"
            secureTextEntry={isPassword && !showPassword}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8} className="pl-2" activeOpacity={0.7}>
              <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <View className="flex-row items-center mt-1.5">
            <Icon name="alert-circle" size={12} color="#DC2626" />
            <Text className="text-danger text-xs ml-1">{error}</Text>
          </View>
        )}
      </View>
    );
  },
);
