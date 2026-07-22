import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProgressRing } from './ProgressRing';
import { MiniChart } from './MiniChart';
import { Icon } from './Icon';
import { cardShadow } from '../../constants/shadows';
import { getScoreColor, getScoreLabel } from '../../utils/health-tones';
import type { HealthScoreTrendPoint } from '../../types';

interface HealthScoreBreakdown {
  fator: string;
  pontos: number;
  maximo: number;
}

interface HealthScoreProps {
  score: number;
  factors?: { label: string; value: number; icon: string }[];
  breakdown?: HealthScoreBreakdown[];
  trend?: HealthScoreTrendPoint[];
  classificacao?: string;
  explicacao?: string;
  streak?: number;
}

export function HealthScore({ score, factors, breakdown, trend, classificacao, explicacao, streak }: HealthScoreProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const color = getScoreColor(score);
  const label = classificacao || getScoreLabel(score);

  return (
    <View className="bg-surface rounded-4xl p-5 border border-gray-100 mb-5" style={cardShadow}>
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

      <View className="flex-row items-center gap-5 my-4">
        <View style={{ width: 132, height: 132 }}>
          <ProgressRing progress={score / 100} size={132} strokeWidth={12} color={color} />
          <View style={{ position: 'absolute', inset: 0 }} className="items-center justify-center">
            <Text style={{ fontSize: 40, fontWeight: '800', letterSpacing: -1, lineHeight: 40 }} className="text-gray-900">{score}</Text>
            <Text style={{ fontSize: 11, marginTop: 1 }} className="text-gray-400 font-semibold">de 100</Text>
          </View>
        </View>
        <View className="flex-1">
          <View style={{ backgroundColor: `${color}1A`, alignSelf: 'flex-start' }} className="px-3.5 py-1.5 rounded-full">
            <Text style={{ color }} className="text-xs font-bold">{label}</Text>
          </View>
          {trend && trend.length >= 2 && (
            <>
              <Text className="text-xs text-gray-500 mt-3">Tendência dos últimos 7 dias</Text>
              <View className="mt-1.5">
                <MiniChart data={trend.map((t) => t.score)} width={140} height={40} color={color} />
              </View>
            </>
          )}
        </View>
      </View>

      {breakdown && breakdown.length > 0 ? (
        <View className="gap-2">
          {breakdown.map((b, i) => (
            <View key={i} className="flex-row items-center">
              <Text style={{ fontSize: 11.5, width: 96 }} className="text-gray-500" numberOfLines={1}>{b.fator}</Text>
              <View style={{ height: 7 }} className="flex-1 bg-gray-100 rounded-full overflow-hidden mx-2">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${Math.min((b.pontos / b.maximo) * 100, 100)}%`, backgroundColor: color }}
                />
              </View>
              <Text style={{ fontSize: 11.5, width: 38 }} className="font-bold text-gray-700 text-right">{b.pontos}/{b.maximo}</Text>
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
