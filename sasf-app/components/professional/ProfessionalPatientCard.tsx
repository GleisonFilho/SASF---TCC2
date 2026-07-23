import { View, Text, TouchableOpacity } from 'react-native';
import { IconBadge } from '../ui/IconBadge';
import { ScopeBadge } from './ScopeBadge';
import type { AcessoProfissional } from '../../types';

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ProfessionalPatientCard({ item, onPress }: { item: AcessoProfissional; onPress: () => void }) {
  const dias = daysUntil(item.dataExpiracao);
  const urgent = dias <= 3;

  return (
    <TouchableOpacity className="bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5" onPress={onPress} activeOpacity={0.7}>
      <View className="flex-row items-start">
        <IconBadge icon="person" color="#2563EB" />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.membro?.nome}</Text>
            <View className={`px-2.5 py-1 rounded-full ${urgent ? 'bg-warning-light' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${urgent ? 'text-warning' : 'text-gray-500'}`}>
                {dias > 0 ? `Expira em ${dias}d` : 'Expirado'}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400 mt-0.5">{item.membro?.parentesco} · Concedido por {item.concedidoPor?.nome}</Text>
          <View className="flex-row flex-wrap mt-2.5">
            {item.escopos.map((e) => <ScopeBadge key={e.id} escopo={e.categoriaDado} />)}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
