import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
}

export function LineChart({ data, color = '#2563EB', height = 160, unit = '' }: LineChartProps) {
  if (data.length === 0) {
    return (
      <View style={{ height }} className="items-center justify-center">
        <Text className="text-gray-300 text-sm">Sem dados suficientes</Text>
      </View>
    );
  }

  const width = Math.max(data.length * 56, 280);
  const padding = 24;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" strokeWidth="1" />
        <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
        ))}
      </Svg>
      <View className="flex-row justify-between mt-1" style={{ width }}>
        {points.map((p, i) => (
          <Text key={i} className="text-xs text-gray-400" style={{ width: 56, textAlign: 'center' }}>{p.label}</Text>
        ))}
      </View>
      <Text className="text-xs text-gray-400 mt-1">
        Min: {min}{unit} · Max: {max}{unit}
      </Text>
    </View>
  );
}
