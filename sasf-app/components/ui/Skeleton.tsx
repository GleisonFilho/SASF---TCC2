import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
}

export function Skeleton({ width = '100%', height = 16, rounded = false }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{ width: width as any, height, opacity, borderRadius: rounded ? 9999 : 12 }}
      className="bg-gray-200"
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5">
      <View className="flex-row items-center">
        <Skeleton width={48} height={48} rounded />
        <View className="flex-1 ml-4">
          <Skeleton width="70%" height={16} />
          <View className="mt-2">
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="px-5 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}
