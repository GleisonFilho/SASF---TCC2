import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { Icon, type IoniconsName } from '../ui/Icon';

interface HealthSectionProps<T> {
  title: string;
  icon?: IoniconsName;
  data: T[] | undefined;
  isLoading: boolean;
  renderItem: (item: T) => React.ReactNode;
  onAdd: () => void;
  onDelete: (item: T) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  addLabel: string;
  emptyIcon?: IoniconsName;
  emptyText?: string;
}

export function HealthSection<T>({
  title, icon, data, isLoading, renderItem, onAdd, onDelete, getId, getLabel, addLabel, emptyIcon = 'file-tray-outline', emptyText = 'Nenhum registro.',
}: HealthSectionProps<T>) {
  const handleDelete = (item: T) => {
    Alert.alert('Remover', `Remover "${getLabel(item)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => onDelete(item) },
    ]);
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {icon && <Icon name={icon} size={17} color="#0F172A" />}
          <Text className={`text-base font-bold text-gray-900 ${icon ? 'ml-2' : ''}`}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onAdd} className="bg-primary/10 px-3 py-1.5 rounded-lg flex-row items-center" activeOpacity={0.7}>
          <Icon name="add" size={14} color="#2563EB" />
          <Text className="text-primary text-xs font-semibold ml-0.5">{addLabel}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View>
          <View className="bg-white rounded-2xl p-4 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5">
            <Skeleton width="60%" height={14} />
            <View className="mt-2"><Skeleton width="40%" height={10} /></View>
          </View>
          <View className="bg-white rounded-2xl p-4 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5">
            <Skeleton width="50%" height={14} />
            <View className="mt-2"><Skeleton width="30%" height={10} /></View>
          </View>
        </View>
      ) : !data?.length ? (
        <View className="bg-white rounded-2xl py-7 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
          <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center mb-2.5">
            <Icon name={emptyIcon} size={20} color="#CBD5E1" />
          </View>
          <Text className="text-gray-400 text-sm text-center px-6">{emptyText}</Text>
        </View>
      ) : (
        data.map((item) => (
          <TouchableOpacity
            key={getId(item)}
            className="bg-white rounded-2xl p-4 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5"
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            {renderItem(item)}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}
