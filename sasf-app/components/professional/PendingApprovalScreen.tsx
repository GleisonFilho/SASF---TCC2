import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import type { User } from '../../types';

interface PendingApprovalScreenProps {
  profissionalDetalhe?: User['profissionalDetalhe'];
  checking: boolean;
  onCheckStatus: () => void;
  onLogout: () => void;
}

export function PendingApprovalScreen({ profissionalDetalhe, checking, onCheckStatus, onLogout }: PendingApprovalScreenProps) {
  const rejeitado = profissionalDetalhe?.statusValidacao === 'REJECTED';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 items-center justify-center">
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${rejeitado ? 'bg-danger-light' : 'bg-primary-50'}`}>
          <Icon name={rejeitado ? 'close-circle-outline' : 'time-outline'} size={44} color={rejeitado ? '#DC2626' : '#2563EB'} />
        </View>

        <Text className="text-xl font-bold text-gray-900 text-center">
          {rejeitado ? 'Cadastro não aprovado' : 'Cadastro em análise'}
        </Text>
        <Text className="text-sm text-gray-400 text-center mt-2 px-4">
          {rejeitado
            ? 'Seu cadastro profissional não foi aprovado pelo administrador. Entre em contato com o suporte para mais informações.'
            : 'Seu cadastro está sendo analisado por um administrador. Você poderá acessar os dados dos pacientes assim que for aprovado.'}
        </Text>

        {profissionalDetalhe && (
          <View className="bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5 w-full mt-6">
            <Text className="text-xs font-bold text-gray-400 mb-3" style={{ letterSpacing: 0.5 }}>DADOS ENVIADOS</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-400">Registro Profissional</Text>
              <Text className="text-xs font-semibold text-gray-900">{profissionalDetalhe.registroProfissional}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-400">Categoria</Text>
              <Text className="text-xs font-semibold text-gray-900">{profissionalDetalhe.categoriaConselho}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-400">UF</Text>
              <Text className="text-xs font-semibold text-gray-900">{profissionalDetalhe.ufConselho}</Text>
            </View>
          </View>
        )}

        <View className="w-full mt-8" style={{ gap: 12 }}>
          {!rejeitado && (
            <Button title="Verificar status" onPress={onCheckStatus} loading={checking} />
          )}
          <TouchableOpacity onPress={onLogout} className="py-3 items-center" activeOpacity={0.7}>
            <Text className="text-gray-400 text-sm font-semibold">Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
