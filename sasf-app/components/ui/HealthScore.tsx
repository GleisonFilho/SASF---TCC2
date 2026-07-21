import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProgressRing } from './ProgressRing';
import { Icon } from './Icon';

interface HealthScoreBreakdown {
  fator: string;
  pontos: number;
  maximo: number;
}

interface HealthScoreProps {
  score: number;
  factors?: { label: string; value: number; icon: string }[];
  breakdown?: HealthScoreBreakdown[];
  classificacao?: string;
  explicacao?: string;
  streak?: number;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#16A34A';
  if (score >= 70) return '#84CC16';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#F97316';
  return '#DC2626';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 50) return 'Regular';
  if (score >= 30) return 'Atenção';
  return 'Crítico';
}

export function HealthScore({ score, factors, breakdown, classificacao, explicacao, streak }: HealthScoreProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const color = getScoreColor(score);
  const label = classificacao || getScoreLabel(score);

  return (
    <View className="bg-surface rounded-3xl p-5 border border-gray-100 mb-5 shadow-md shadow-gray-900/10">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base font-bold text-gray-900">Score de Saúde</Text>
        <View className="flex-row items-center gap-2">
          {!!streak && streak > 0 && (
            <View className="flex-row items-center bg-warning-light px-2.5 py-1 rounded-full">
              <Icon name="flame" size={12} color="#F59E0B" />
              <Text className="text-warning text-xs font-bold ml-1">{streak}d</Text>
            </View>
          )}
          {explicacao && (
            <TouchableOpacity onPress={() => setShowExplanation((v) => !v)} hitSlop={8} activeOpacity={0.7}>
              <Icon name="information-circle-outline" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showExplanation && explicacao && (
        <View className="bg-primary-50 rounded-xl p-3 mb-2 mt-3">
          <Text className="text-xs text-primary leading-5">{explicacao}</Text>
        </View>
      )}

      <View className="items-center my-4">
        <ProgressRing progress={score / 100} size={132} strokeWidth={11} color={color} label={`${score}`} />
        <View style={{ backgroundColor: `${color}1A` }} className="px-3.5 py-1.5 rounded-full mt-3">
          <Text style={{ color }} className="text-xs font-bold">{label}</Text>
        </View>
      </View>

      {breakdown && breakdown.length > 0 ? (
        <View className="gap-2">
          {breakdown.map((b, i) => (
            <View key={i} className="flex-row items-center">
              <Text className="text-xs text-gray-500 w-32" numberOfLines={1}>{b.fator}</Text>
              <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-2">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${Math.min((b.pontos / b.maximo) * 100, 100)}%`, backgroundColor: color }}
                />
              </View>
              <Text className="text-xs font-semibold text-gray-700 w-10 text-right">{b.pontos}/{b.maximo}</Text>
            </View>
          ))}
        </View>
      ) : factors && factors.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 justify-center">
          {factors.map((f, i) => (
            <View key={i} className="bg-gray-50 rounded-lg px-3 py-1.5 flex-row items-center">
              <Text className="text-sm mr-1">{f.icon}</Text>
              <Text className="text-xs text-gray-600">{f.label}</Text>
              <Text className="text-xs font-bold text-gray-900 ml-1">{f.value}/10</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
