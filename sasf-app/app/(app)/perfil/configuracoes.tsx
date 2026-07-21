import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toast';
import { useSettingsStore, type ThemePreference } from '../../../store/settingsStore';
import { useLogout } from '../../../hooks/useAuth';

const themeOptions: { value: ThemePreference; label: string; icon: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline' }[] = [
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Escuro', icon: 'moon-outline' },
  { value: 'auto', label: 'Automático', icon: 'phone-portrait-outline' },
];

const PRIVACY_TEXT = `O SASF coleta apenas os dados de saúde que você opta por registrar (sinais vitais, nutrição, exercícios, bem-estar emocional e informações de membros da família). Esses dados são armazenados de forma segura e nunca são compartilhados com terceiros sem o seu consentimento explícito.

Em conformidade com a LGPD, você tem direito a acessar, corrigir e excluir seus dados a qualquer momento. O compartilhamento com profissionais de saúde é feito por meio de tokens de acesso temporários, com escopo definido por você, revogáveis a qualquer momento. Todo acesso de profissionais aos seus dados é registrado em log de auditoria.`;

const TERMS_TEXT = `Ao utilizar o SASF, você concorda em fornecer informações verdadeiras sobre sua saúde e a de seus familiares. O aplicativo é uma ferramenta de apoio ao acompanhamento de saúde e não substitui consulta, diagnóstico ou tratamento médico profissional.

As recomendações geradas pelo sistema de insights são informativas e baseadas em regras gerais de saúde, não constituindo aconselhamento médico individualizado. Em caso de emergência, procure atendimento médico imediato.`;

export default function ConfiguracoesScreen() {
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = useSettingsStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();
  const [expanded, setExpanded] = useState<'privacy' | 'terms' | null>(null);

  const handleClearCache = () => {
    Alert.alert('Limpar cache', 'Isso vai recarregar todos os dados do aplicativo. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        onPress: () => {
          queryClient.clear();
          toast.show('Cache limpo com sucesso!', 'success');
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logoutMutation.mutate() },
    ]);
  };

  return (
    <ScreenContainer>
      {/* Tema */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Aparência</Text>
      <View className="flex-row gap-2 mb-6">
        {themeOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            className={`flex-1 py-3.5 rounded-xl items-center border ${theme === opt.value ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-surface border-gray-200'}`}
            onPress={() => setTheme(opt.value)}
            activeOpacity={0.8}
          >
            <Icon name={opt.icon} size={20} color={theme === opt.value ? '#fff' : '#64748B'} />
            <Text className={`text-xs font-semibold mt-1.5 ${theme === opt.value ? 'text-white' : 'text-gray-600'}`}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notificações */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Notificações</Text>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <Row icon="notifications-outline" iconBg="bg-primary-50" iconColor="#2563EB" label="Notificações push" right={
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: '#2563EB' }} />
        } />
      </View>

      {/* Idioma */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Idioma</Text>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <Row icon="language-outline" iconBg="bg-secondary-light" iconColor="#059669" label="Português (Brasil)" right={<View className="bg-success-light px-2 py-1 rounded-full"><Text className="text-success text-xs font-bold">Ativo</Text></View>} />
        <Divider />
        <Row icon="language-outline" iconBg="bg-gray-100" iconColor="#CBD5E1" label="English" right={<View className="bg-gray-100 px-2 py-1 rounded-full"><Text className="text-gray-400 text-xs font-bold">Em breve</Text></View>} muted />
      </View>

      {/* Dados e Privacidade */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Dados e Privacidade</Text>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5 mb-2">
        <TouchableOpacity onPress={() => setExpanded(expanded === 'privacy' ? null : 'privacy')} activeOpacity={0.7}>
          <Row icon="shield-outline" iconBg="bg-accent-light" iconColor="#0E7490" label="Política de Privacidade" right={<Icon name={expanded === 'privacy' ? 'chevron-up' : 'chevron-down'} size={18} color="#CBD5E1" />} />
        </TouchableOpacity>
        {expanded === 'privacy' && (
          <View className="px-4 pb-4">
            <Text className="text-xs text-gray-500 leading-5">{PRIVACY_TEXT}</Text>
          </View>
        )}
      </View>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <TouchableOpacity onPress={() => setExpanded(expanded === 'terms' ? null : 'terms')} activeOpacity={0.7}>
          <Row icon="document-text-outline" iconBg="bg-accent-light" iconColor="#0E7490" label="Termos de Uso" right={<Icon name={expanded === 'terms' ? 'chevron-up' : 'chevron-down'} size={18} color="#CBD5E1" />} />
        </TouchableOpacity>
        {expanded === 'terms' && (
          <View className="px-4 pb-4">
            <Text className="text-xs text-gray-500 leading-5">{TERMS_TEXT}</Text>
          </View>
        )}
      </View>

      {/* Manutenção */}
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">Manutenção</Text>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <TouchableOpacity onPress={handleClearCache} activeOpacity={0.7}>
          <Row icon="trash-outline" iconBg="bg-gray-100" iconColor="#475569" label="Limpar Cache" />
        </TouchableOpacity>
      </View>

      {/* Sair */}
      <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} className="bg-danger-light rounded-2xl border border-danger/10 mb-4">
        <Row icon="log-out-outline" iconBg="bg-white" iconColor="#DC2626" label="Sair da Conta" danger />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function Row({ icon, iconBg, iconColor, label, right, danger, muted }: { icon: IoniconsName; iconBg?: string; iconColor?: string; label: string; right?: React.ReactNode; danger?: boolean; muted?: boolean }) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${iconBg || ''}`}>
        <Icon name={icon} size={17} color={iconColor || (danger ? '#DC2626' : muted ? '#CBD5E1' : '#64748B')} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-danger' : muted ? 'text-gray-400' : 'text-gray-700'}`}>{label}</Text>
      {right}
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-gray-50 mx-4" />;
}
