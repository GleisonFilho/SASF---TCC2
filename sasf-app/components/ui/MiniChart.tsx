import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniChart({ data, width = 80, height = 32, color = '#2563EB' }: MiniChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
