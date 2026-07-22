import { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';
import { primaryShadow } from '../../constants/shadows';

const SHIELD_PATH = 'M12 3.2 19 6v6c0 4.4-3 7.3-7 8.8-4-1.5-7-4.4-7-8.8V6l7-2.8Z';
const PULSE_PATH = 'M6.5 12.4H9.4l1.2-3 2 6 1.3-3H17.5';

interface LogoProps {
  size?: number;
  /**
   * full = escudo preenchido em gradiente azul→ciano (padrão, telas de destaque)
   * icon = escudo preenchido em cor sólida (contextos pequenos/densos)
   * mono = apenas contorno, sem preenchimento (fundos escuros, marca d'água)
   */
  variant?: 'full' | 'icon' | 'mono';
  color?: string;
}

export function Logo({ size = 72, variant = 'full', color = '#2563EB' }: LogoProps) {
  const strokeWidth = variant === 'mono' ? 1.4 : 1.6;

  const svg = (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {variant === 'full' && (
        <Defs>
          <SvgLinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#06B6D4" />
          </SvgLinearGradient>
        </Defs>
      )}
      <Path
        d={SHIELD_PATH}
        fill={variant === 'full' ? 'url(#logoGradient)' : variant === 'icon' ? color : 'none'}
        stroke={variant === 'mono' ? color : 'none'}
        strokeWidth={variant === 'mono' ? strokeWidth : 0}
        strokeLinejoin="round"
      />
      <Path
        d={PULSE_PATH}
        fill="none"
        stroke={variant === 'mono' ? color : '#fff'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  if (variant !== 'full') return svg;
  return <View style={{ width: size, height: size, ...primaryShadow }}>{svg}</View>;
}
