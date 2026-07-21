import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Icon } from '../ui/Icon';

interface AddModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AddModal({ visible, title, onClose, children }: AddModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <TouchableOpacity className="flex-1 bg-black/30" onPress={onClose} activeOpacity={1} />
        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[80%]">
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-gray-200" />
          </View>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center" activeOpacity={0.7}>
              <Icon name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
