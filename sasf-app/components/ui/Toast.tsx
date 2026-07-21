import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { create } from 'zustand';
import { Icon, type IoniconsName } from './Icon';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  type: 'success',
  visible: false,
  show: (message, type = 'success') => {
    set({ message, type, visible: true });
    setTimeout(() => set({ visible: false }), 3000);
  },
  hide: () => set({ visible: false }),
}));

const bgColors = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary',
};

const icons: Record<'success' | 'error' | 'info', IoniconsName> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

export function ToastProvider() {
  const { message, type, visible } = useToast();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -100,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }], position: 'absolute', top: 50, left: 16, right: 16, zIndex: 9999 }}
      pointerEvents="none"
    >
      <View className={`${bgColors[type]} rounded-2xl px-5 py-4 flex-row items-center shadow-md shadow-gray-900/20`}>
        <Icon name={icons[type]} size={20} color="#fff" />
        <Text className="text-white text-sm font-semibold flex-1 ml-3">{message}</Text>
      </View>
    </Animated.View>
  );
}
