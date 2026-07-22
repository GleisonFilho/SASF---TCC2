import type { ViewStyle } from 'react-native';

// Sombras suaves e coloridas do mockup (box-shadow com blur grande e spread
// negativo), traduzidas para as props de sombra do React Native. Opacidade
// reduzida em relação ao valor CSS original porque RN não tem "spread"
// negativo para suavizar o alpha alto.

export const cardShadow: ViewStyle = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 4,
};

export const primaryShadow: ViewStyle = {
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 6,
};

export const dangerShadow: ViewStyle = {
  shadowColor: '#DC2626',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 14,
  elevation: 6,
};

export const accentShadow: ViewStyle = {
  shadowColor: '#06B6D4',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.32,
  shadowRadius: 14,
  elevation: 6,
};
