import { View, ScrollView, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export function ScreenContainer({ children, scroll = true, ...props }: ScreenContainerProps) {
  const content = <View className="flex-1 px-5 py-4" {...props}>{children}</View>;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {scroll ? <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
