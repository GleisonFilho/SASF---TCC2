import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { IconBadge } from '../../../components/ui/IconBadge';
import { StatCard } from '../../../components/ui/StatCard';
import { HealthScore } from '../../../components/ui/HealthScore';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { HealthSection } from '../../../components/health/HealthSection';
import { ScopeBadge } from '../../../components/professional/ScopeBadge';
import { ExpiryBanner } from '../../../components/professional/ExpiryBanner';
import { ProfessionalNotes } from '../../../components/professional/ProfessionalNotes';
import { usePatientData } from '../../../hooks/useSharing';
import { calcAge } from '../../../utils/date';
import { tipoMedicaoLabels, tipoRefeicaoLabels, tipoExercicioLabels, intensidadeExercicioColor } from '../../../utils/labels';
import { statusColors, gravidadeColors, intensityTone, tipoMedicaoIcon } from '../../../utils/health-tones';
import type { CondicaoSaude, Alergia, MedicamentoUso, ContatoEmergencia, SinalVital, RegistroSintoma, RegistroExercicio, RegistroPsicologico, RegistroRefeicao } from '../../../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function moodTone(value: number): string {
  if (value >= 7) return '#16A34A';
  if (value >= 4) return '#D97706';
  return '#DC2626';
}

function MoodBadge({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
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

export default function PacienteDetailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { data, isLoading, error, refetch } = usePatientData(token || '');

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message="Erro ao carregar dados do paciente. O acesso pode ter expirado ou sido revogado." onRetry={refetch} />;

  const { membro, concedidoPor, escopos, dataExpiracao, dados } = data;
  const pesoRecente = dados.nutricao?.pesoRecente || [];
  const pesoChartData = pesoRecente.slice(0, 7).reverse().map((w) => parseFloat(w.pesoKg));

  return (
    <ScreenContainer>
      <View className="bg-surface rounded-4xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <View className="items-center">
          <View className="bg-primary-50 w-16 h-16 rounded-full items-center justify-center mb-3">
            <Text className="text-primary font-bold text-2xl">{membro.nome[0]}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{membro.nome}</Text>
          <Text className="text-sm text-gray-400 mt-1">{membro.parentesco} · {calcAge(membro.dataNascimento)} anos · {membro.sexo}</Text>
          <View className="flex-row flex-wrap justify-center mt-3">
            {escopos.map((e) => <ScopeBadge key={e} escopo={e} />)}
          </View>
        </View>
      </View>

      <ExpiryBanner dataExpiracao={dataExpiracao} concedidoPorNome={concedidoPor.nome} />

      {escopos.includes('HEALTH_SCORE') && dados.healthScore && (
        <HealthScore
          score={dados.healthScore.score}
          classificacao={dados.healthScore.classificacao}
          breakdown={dados.healthScore.breakdown}
          trend={dados.healthScore.trend}
          explicacao={dados.healthScore.explicacao}
        />
      )}

      {escopos.includes('VITAIS') && (
        <HealthSection<SinalVital>
          title="Sinais Vitais" icon="heart" emptyIcon="stats-chart-outline" emptyText="Nenhum sinal vital registrado."
          data={dados.sinaisVitais} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => tipoMedicaoLabels[item.tipoMedicao] || item.tipoMedicao}
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
      )}

      {escopos.includes('SINTOMAS') && (
        <HealthSection<RegistroSintoma>
          title="Sintomas" icon="thermometer-outline" emptyIcon="happy-outline" emptyText="Nenhum sintoma registrado."
          data={dados.sintomas} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => item.descricao}
          renderItem={(item) => {
            const tone = intensityTone(item.intensidade);
            return (
              <View className="flex-row items-start">
                <IconBadge icon="thermometer" color={tone.color} />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.descricao}</Text>
                    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.bgHex }}>
                      <Text className="text-xs font-semibold" style={{ color: tone.textHex }}>{item.intensidade}/10</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">{fmtDate(item.dataHoraOcorrencia)}</Text>
                  {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}

      {escopos.includes('NUTRICAO') && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="nutrition-outline" size={17} color="#0F172A" />
            <Text className="text-base font-bold text-gray-900 ml-2">Nutrição</Text>
          </View>
          {pesoRecente[0] && (
            <View className="mb-3">
              <StatCard icon="scale-outline" iconColor="#2563EB" iconBg="bg-primary-50" title="Peso Atual" value={`${pesoRecente[0].pesoKg} kg`} subtitle={pesoRecente[0].imc ? `IMC ${pesoRecente[0].imc}` : undefined} chartData={pesoChartData} chartColor="#2563EB" />
            </View>
          )}
          <HealthSection<RegistroRefeicao>
            title="Refeições Recentes" emptyIcon="restaurant-outline" emptyText="Nenhuma refeição registrada."
            data={dados.nutricao?.refeicoes} isLoading={false} readOnly
            getId={(item) => item.id} getLabel={(item) => item.descricao}
            renderItem={(item) => (
              <View className="flex-row items-start">
                <IconBadge icon="restaurant" color="#16A34A" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">{tipoRefeicaoLabels[item.tipo] || item.tipo}</Text>
                    <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{item.descricao}{item.calorias ? ` · ${item.calorias}kcal` : ''}</Text>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {escopos.includes('EXERCICIOS') && (
        <HealthSection<RegistroExercicio>
          title="Exercícios" icon="barbell-outline" emptyIcon="walk-outline" emptyText="Nenhum exercício registrado."
          data={dados.exercicios} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => tipoExercicioLabels[item.tipo] || item.tipo}
          renderItem={(item) => {
            const color = intensidadeExercicioColor[item.intensidade] || '#16A34A';
            return (
              <View className="flex-row items-start">
                <IconBadge icon="barbell" color="#16A34A" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">{tipoExercicioLabels[item.tipo] || item.tipo}</Text>
                    <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <Text className="text-xs text-gray-500">{item.duracaoMin}min{item.caloriasEst ? ` · ${item.caloriasEst}kcal` : ''}</Text>
                    <View style={{ backgroundColor: `${color}1A` }} className="px-2 py-0.5 rounded-full">
                      <Text style={{ color }} className="text-[11px] font-semibold">{item.intensidade}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {escopos.includes('PSICOLOGIA') && (
        <HealthSection<RegistroPsicologico>
          title="Bem-estar Psicológico" icon="happy-outline" emptyIcon="happy-outline" emptyText="Nenhum registro de bem-estar."
          data={dados.psicologico} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => `Humor: ${item.humor}/10`}
          renderItem={(item) => (
            <View className="flex-row items-start">
              <IconBadge icon="happy" color={moodTone(item.humor)} />
              <View className="flex-1 ml-3">
                <Text className="text-xs text-gray-400 mb-1.5">{fmtDate(item.dataHora)}</Text>
                <View className="flex-row gap-2 flex-wrap">
                  <MoodBadge label={`Humor ${item.humor}`} value={item.humor} />
                  <MoodBadge label={`Sono ${item.qualidadeSono}`} value={item.qualidadeSono} />
                  <MoodBadge label={`Energia ${item.energia}`} value={item.energia} />
                  <MoodBadge label={`Ansiedade ${item.ansiedade}`} value={item.ansiedade} invert />
                  <MoodBadge label={`Estresse ${item.estresse}`} value={item.estresse} invert />
                </View>
              </View>
            </View>
          )}
        />
      )}

      {escopos.includes('CONDICOES') && (
        <HealthSection<CondicaoSaude>
          title="Condições de Saúde" icon="medkit-outline" emptyIcon="checkmark-circle-outline" emptyText="Nenhuma condição registrada."
          data={dados.condicoes} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => item.nomeCondicao}
          renderItem={(item) => {
            const tone = statusColors[item.status] || statusColors.ATIVA;
            return (
              <View className="flex-row items-start">
                <IconBadge icon="medkit" color={tone.color} />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.nomeCondicao}</Text>
                    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.bgHex }}>
                      <Text className="text-xs font-semibold" style={{ color: tone.textHex }}>{item.status}</Text>
                    </View>
                  </View>
                  {item.dataDiagnostico && <Text className="text-xs text-gray-400 mt-1">Diagnóstico: {item.dataDiagnostico}</Text>}
                  {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}

      {escopos.includes('ALERGIAS') && (
        <HealthSection<Alergia>
          title="Alergias" icon="warning-outline" emptyIcon="shield-checkmark-outline" emptyText="Nenhuma alergia registrada."
          data={dados.alergias} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => item.substancia}
          renderItem={(item) => {
            const tone = gravidadeColors[item.gravidade] || gravidadeColors.LEVE;
            return (
              <View className="flex-row items-start">
                <IconBadge icon="warning" color={tone.color} />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.substancia}</Text>
                    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: tone.bgHex }}>
                      <Text className="text-xs font-semibold" style={{ color: tone.textHex }}>{item.gravidade}</Text>
                    </View>
                  </View>
                  {item.reacao && <Text className="text-xs text-gray-400 mt-1">Reação: {item.reacao}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}

      {escopos.includes('MEDICAMENTOS') && (
        <HealthSection<MedicamentoUso>
          title="Medicamentos em Uso" icon="medical-outline" emptyIcon="medical-outline" emptyText="Nenhum medicamento registrado."
          data={dados.medicamentos} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => item.nomeMedicamento}
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
      )}

      {escopos.includes('CONTATOS') && (
        <HealthSection<ContatoEmergencia>
          title="Contatos de Emergência" icon="call-outline" emptyIcon="call-outline" emptyText="Nenhum contato de emergência."
          data={dados.contatos} isLoading={false} readOnly
          getId={(item) => item.id} getLabel={(item) => item.nome}
          renderItem={(item) => (
            <View className="flex-row items-start">
              <IconBadge icon="call" color="#2563EB" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-900">{item.nome}</Text>
                <View className="flex-row items-center mt-1">
                  <Icon name="people-outline" size={12} color="#94A3B8" />
                  <Text className="text-xs text-gray-400 ml-1 mr-3">{item.parentesco}</Text>
                  <Icon name="call-outline" size={12} color="#94A3B8" />
                  <Text className="text-xs text-gray-400 ml-1">{item.telefone}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {token && <ProfessionalNotes token={token} />}
    </ScreenContainer>
  );
}
