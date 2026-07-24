import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { IconBadge } from '../../../../components/ui/IconBadge';
import { Icon, type IoniconsName } from '../../../../components/ui/Icon';
import { useRelatorio } from '../../../../hooks/useRelatorio';
import { statusColors, gravidadeColors, intensityTone, tipoMedicaoIcon } from '../../../../utils/health-tones';
import { tipoMedicaoLabels } from '../../../../utils/labels';
import type {
  CondicaoSaude, Alergia, MedicamentoUso, SinalVital, RegistroSintoma,
  RegistroPeso, RegistroExercicio,
} from '../../../../types';

const tipoExercicioLabel: Record<string, string> = {
  CAMINHADA: 'Caminhada', CORRIDA: 'Corrida', ACADEMIA: 'Academia',
  CICLISMO: 'Ciclismo', NATACAO: 'Natação', FUTEBOL: 'Futebol', OUTRO: 'Outro',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: '#06B6D4' };
  if (imc < 25) return { label: 'Peso normal', color: '#16A34A' };
  if (imc < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
  return { label: 'Obesidade', color: '#DC2626' };
}

function Badge({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value <= 4 : value >= 7;
  const mid = invert ? value <= 6 : value >= 4;
  const bgHex = good ? '#DCFCE7' : mid ? '#FEF9C3' : '#FEE2E2';
  const textHex = good ? '#15803D' : mid ? '#A16207' : '#B91C1C';
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: bgHex }}>
      <Text className="text-xs font-semibold" style={{ color: textHex }}>{label}</Text>
    </View>
  );
}

function ReportSection<T>({
  title, icon, data, emptyText, renderItem, getId,
}: {
  title: string;
  icon: IoniconsName;
  data: T[] | undefined;
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
  getId: (item: T) => string;
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Icon name={icon} size={17} color="#0F172A" />
        <Text className="text-base font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      {!data?.length ? (
        <View className="bg-white rounded-2xl py-7 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
          <Text className="text-gray-400 text-sm text-center px-6">{emptyText}</Text>
        </View>
      ) : (
        data.map((item) => (
          <View key={getId(item)} className="bg-white rounded-2xl p-4 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5">
            {renderItem(item)}
          </View>
        ))
      )}
    </View>
  );
}

export default function RelatorioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const membroId = id || '';
  const relatorio = useRelatorio(membroId);

  if (relatorio.isLoading) return <LoadingScreen />;
  if (relatorio.error || !relatorio.data) return <ErrorMessage message="Erro ao carregar relatório." onRetry={relatorio.refetch} />;

  const { condicoes, alergias, medicamentos, sinaisVitais, sintomas, nutricional, exercicios, psicologico } = relatorio.data;

  const hasAnyData =
    condicoes.length > 0 || alergias.length > 0 || medicamentos.length > 0 ||
    sinaisVitais.length > 0 || sintomas.length > 0 ||
    nutricional.pesoRecente.length > 0 || exercicios.length > 0 || psicologico.length > 0;

  if (!hasAnyData) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="document-text-outline"
          title="Sem dados para o relatório"
          description="Registre condições, sinais vitais, sintomas e outros dados de saúde para gerar um relatório."
        />
      </ScreenContainer>
    );
  }

  const currentWeight = nutricional.pesoRecente[0] || null;
  const currentIMC = currentWeight?.imc ? parseFloat(currentWeight.imc) : null;
  const imcCategory = currentIMC !== null ? getIMCCategory(currentIMC) : null;

  const exerciseTotalMin = exercicios.reduce((s, e) => s + e.duracaoMin, 0);
  const latestPsych = psicologico[0] || null;

  return (
    <ScreenContainer>
      <View className="flex-row items-center mb-1">
        <Text className="text-xs text-gray-400">Gerado em {fmtDate(relatorio.data.geradoEm)}</Text>
      </View>

      {/* Condições de Saúde */}
      <ReportSection<CondicaoSaude>
        title="Condições de Saúde"
        icon="medkit-outline"
        data={condicoes}
        emptyText="Nenhuma condição registrada."
        getId={(item) => item.id}
        renderItem={(item) => {
          const tone = statusColors[item.status] || statusColors.ATIVA;
          return (
            <View className="flex-row items-start">
              <IconBadge icon="medkit" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.nomeCondicao}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.status}</Text>
                  </View>
                </View>
                {item.dataDiagnostico && <Text className="text-xs text-gray-400 mt-1">Diagnóstico: {item.dataDiagnostico}</Text>}
                {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Alergias */}
      <ReportSection<Alergia>
        title="Alergias"
        icon="warning-outline"
        data={alergias}
        emptyText="Nenhuma alergia registrada."
        getId={(item) => item.id}
        renderItem={(item) => {
          const tone = gravidadeColors[item.gravidade] || gravidadeColors.LEVE;
          return (
            <View className="flex-row items-start">
              <IconBadge icon="warning" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.substancia}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.gravidade}</Text>
                  </View>
                </View>
                {item.reacao && <Text className="text-xs text-gray-400 mt-1">Reação: {item.reacao}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Medicamentos */}
      <ReportSection<MedicamentoUso>
        title="Medicamentos em Uso"
        icon="medical-outline"
        data={medicamentos}
        emptyText="Nenhum medicamento registrado."
        getId={(item) => item.id}
        renderItem={(item) => (
          <View className="flex-row items-start">
            <IconBadge icon="medical" color="#DC2626" />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.nomeMedicamento}</Text>
                {item.usoContinuo && (
                  <View className="bg-primary-50 px-2.5 py-1 rounded-full">
                    <Text className="text-primary text-xs font-semibold">Contínuo</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {[item.dosagem, item.frequencia].filter(Boolean).join(' · ') || 'Sem detalhes'}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Sinais Vitais */}
      <ReportSection<SinalVital>
        title="Sinais Vitais (recentes)"
        icon="heart"
        data={sinaisVitais}
        emptyText="Nenhum sinal vital registrado."
        getId={(item) => item.id}
        renderItem={(item) => {
          const tone = tipoMedicaoIcon[item.tipoMedicao] || { icon: 'pulse-outline' as IoniconsName, color: '#64748B' };
          return (
            <View className="flex-row items-start">
              <IconBadge icon={tone.icon} color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900">{tipoMedicaoLabels[item.tipoMedicao]}</Text>
                  <Text className="text-xs text-gray-400">{fmtDate(item.dataHoraMedicao)}</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mt-0.5">
                  {item.valorPrimario}{item.valorSecundario ? `/${item.valorSecundario}` : ''} <Text className="text-sm font-semibold text-gray-400">{item.unidade}</Text>
                </Text>
                {item.observacoes && <Text className="text-xs text-gray-400 mt-1">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Sintomas */}
      <ReportSection<RegistroSintoma>
        title="Sintomas (recentes)"
        icon="thermometer-outline"
        data={sintomas}
        emptyText="Nenhum sintoma registrado."
        getId={(item) => item.id}
        renderItem={(item) => {
          const tone = intensityTone(item.intensidade);
          return (
            <View className="flex-row items-start">
              <IconBadge icon="thermometer" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.descricao}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.intensidade}/10</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{fmtDate(item.dataHoraOcorrencia)}</Text>
                {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Peso & IMC */}
      {currentWeight && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="scale-outline" size={17} color="#0F172A" />
            <Text className="text-base font-bold text-gray-900 ml-2">Peso &amp; IMC</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">{currentWeight.pesoKg} <Text className="text-sm font-semibold text-gray-400">kg</Text></Text>
              {currentIMC !== null && imcCategory && (
                <View style={{ backgroundColor: `${imcCategory.color}1A` }} className="px-2.5 py-1 rounded-full">
                  <Text style={{ color: imcCategory.color }} className="text-[11px] font-bold">IMC {currentIMC.toFixed(1)} · {imcCategory.label}</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-400 mt-1">{fmtDate(currentWeight.dataHora)}</Text>
          </View>
          {nutricional.pesoRecente.length > 1 && (
            <ReportSection<RegistroPeso>
              title="Histórico recente"
              icon="time-outline"
              data={nutricional.pesoRecente.slice(1)}
              emptyText=""
              getId={(item) => item.id}
              renderItem={(item) => (
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900">{item.pesoKg} kg{item.imc ? ` · IMC ${item.imc}` : ''}</Text>
                  <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Exercícios */}
      <View className="mb-2">
        <View className="flex-row items-center mb-3">
          <Icon name="barbell-outline" size={17} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Exercícios (resumo)</Text>
        </View>
        {exercicios.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500">Total registrado</Text>
              <Text className="text-lg font-bold text-gray-900 mt-0.5">{exerciseTotalMin} min</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500">Sessões</Text>
              <Text className="text-lg font-bold text-gray-900 mt-0.5">{exercicios.length}</Text>
            </View>
          </View>
        )}
      </View>
      <ReportSection<RegistroExercicio>
        title="Registros"
        icon="fitness-outline"
        data={exercicios}
        emptyText="Nenhum exercício registrado."
        getId={(item) => item.id}
        renderItem={(item) => (
          <View className="flex-row items-start">
            <IconBadge icon="barbell" color="#16A34A" />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900">{tipoExercicioLabel[item.tipo] || item.tipo}</Text>
                <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">{item.duracaoMin}min{item.caloriasEst ? ` · ${item.caloriasEst}kcal` : ''} · {item.intensidade}</Text>
            </View>
          </View>
        )}
      />

      {/* Psicológico */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Icon name="pulse-outline" size={17} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Psicológico (resumo)</Text>
        </View>
        {latestPsych ? (
          <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5">
            <Text className="text-xs text-gray-400 mb-2">Último registro · {fmtDate(latestPsych.dataHora)}</Text>
            <View className="flex-row gap-2 flex-wrap">
              <Badge label={`Humor ${latestPsych.humor}`} value={latestPsych.humor} />
              <Badge label={`Sono ${latestPsych.qualidadeSono}`} value={latestPsych.qualidadeSono} />
              <Badge label={`Energia ${latestPsych.energia}`} value={latestPsych.energia} />
              <Badge label={`Ansiedade ${latestPsych.ansiedade}`} value={latestPsych.ansiedade} invert />
              <Badge label={`Estresse ${latestPsych.estresse}`} value={latestPsych.estresse} invert />
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl py-7 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
            <Text className="text-gray-400 text-sm text-center px-6">Nenhum registro psicológico.</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
