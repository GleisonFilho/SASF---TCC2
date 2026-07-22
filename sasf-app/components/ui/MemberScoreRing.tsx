import { View, Text } from 'react-native';
import { ProgressRing } from './ProgressRing';
import { useHealthScore } from '../../hooks/useWellness';
import { getScoreColor } from '../../utils/health-tones';

interface MemberScoreRingProps {
  membroId: string;
  nome: string;
  size?: number;
}

export function MemberScoreRing({ membroId, nome, size = 44 }: MemberScoreRingProps) {
  const healthScore = useHealthScore(membroId);
  const score = healthScore.data?.score;

  if (score === undefined) {
    return (
      <View className="bg-primary-50 items-center justify-center" style={{ width: size, height: size, borderRadius: size / 2 }}>
        <Text className="text-primary font-bold" style={{ fontSize: size * 0.34 }}>{nome[0]}</Text>
      </View>
    );
  }

  const color = getScoreColor(score);
  return (
    <View style={{ width: size, height: size }}>
      <ProgressRing progress={score / 100} size={size} strokeWidth={size >= 52 ? 4.5 : 4} color={color} />
      <View style={{ position: 'absolute', inset: 0 }} className="items-center justify-center">
        <Text style={{ color, fontSize: size * 0.32 }} className="font-extrabold">{score}</Text>
      </View>
    </View>
  );
}
