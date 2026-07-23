import { View, Text } from 'react-native';
import { Icon } from '../ui/Icon';

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ExpiryBanner({ dataExpiracao, concedidoPorNome }: { dataExpiracao: string; concedidoPorNome?: string }) {
  const dias = daysUntil(dataExpiracao);
  const urgent = dias <= 3;
  const fmtDate = new Date(dataExpiracao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <View className={`rounded-2xl p-4 mb-6 flex-row items-start ${urgent ? 'bg-warning-light' : 'bg-primary-50'}`}>
      <Icon name="shield-checkmark-outline" size={16} color={urgent ? '#D97706' : '#2563EB'} />
      <View className="flex-1 ml-2.5">
        <Text className={`text-xs font-semibold ${urgent ? 'text-warning' : 'text-primary'}`}>
          {concedidoPorNome ? `Acesso concedido por ${concedidoPorNome} · ` : ''}
          {dias > 0 ? `Expira em ${dias} dia${dias === 1 ? '' : 's'} (${fmtDate})` : 'Acesso expirado'}
        </Text>
        <Text className={`text-xs mt-1 ${urgent ? 'text-warning/70' : 'text-primary/70'}`}>
          O paciente pode revogar este acesso a qualquer momento. Todo acesso é registrado para fins de auditoria (LGPD).
        </Text>
      </View>
    </View>
  );
}
