import { View, Text, TouchableOpacity } from 'react-native';

interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ChipSelect({ label, options, value, onChange }: ChipSelectProps) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              className={`px-3.5 py-2 rounded-xl border ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-600'}`}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
