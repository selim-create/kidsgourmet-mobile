import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type AppIconName =
  | 'home'
  | 'home-outline'
  | 'restaurant'
  | 'restaurant-outline'
  | 'compass'
  | 'compass-outline'
  | 'sparkles'
  | 'sparkles-outline'
  | 'book'
  | 'book-outline'
  | 'people'
  | 'people-outline'
  | 'menu-outline'
  | 'notifications-outline'
  | 'person-outline'
  | 'add-circle-outline'
  | 'heart-outline'
  | 'search-outline'
  | 'arrow-back-outline'
  | 'chevron-forward'
  | 'close'
  | 'calendar-outline'
  | 'shield-half-outline'
  | 'shield-checkmark-outline'
  | 'water-outline'
  | 'water'
  | 'analytics-outline'
  | 'checkmark-circle-outline'
  | 'shirt-outline'
  | 'cloud-outline'
  | 'calculator-outline'
  | 'medkit-outline'
  | 'medical-outline'
  | 'speedometer-outline'
  | 'newspaper-outline'
  | 'trending-up-outline'
  | 'leaf-outline'
  | 'settings-outline'
  | 'logo-instagram'
  | 'logo-facebook'
  | 'logo-pinterest'
  | 'logo-youtube'
  | 'logo-tiktok'
  | 'logo-twitter'
  | string;

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Font-free icon renderer.
 *
 * Android release builds were not rendering @expo/vector-icons/Ionicons reliably.
 * This component draws the app's common icons with react-native-svg instead, so
 * icons do not depend on native font bundling/loading.
 */
export function AppIcon({ name, size = 20, color = '#111827', style }: AppIconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const icon = renderIcon(name, color, strokeProps);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {icon}
      </Svg>
    </View>
  );
}

function renderIcon(
  name: AppIconName,
  color: string,
  strokeProps: { stroke: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round' },
) {
  switch (name) {
    case 'home':
    case 'home-outline':
      return (
        <>
          <Path d="M3 11.5 12 4l9 7.5" fill="none" {...strokeProps} />
          <Path d="M5.5 10.5V20h4.2v-5.4h4.6V20h4.2v-9.5" fill="none" {...strokeProps} />
        </>
      );
    case 'restaurant':
    case 'restaurant-outline':
      return (
        <>
          <Line x1="7" y1="3.5" x2="7" y2="20.5" {...strokeProps} />
          <Line x1="4.5" y1="3.5" x2="4.5" y2="9" {...strokeProps} />
          <Line x1="9.5" y1="3.5" x2="9.5" y2="9" {...strokeProps} />
          <Path d="M4.5 9h5" fill="none" {...strokeProps} />
          <Path d="M17 3.5c-2.2 1.9-3.2 4.2-3.2 7.1 0 1.4.9 2.2 2.2 2.4v7.5" fill="none" {...strokeProps} />
          <Path d="M17 3.5v17" fill="none" {...strokeProps} />
        </>
      );
    case 'compass':
    case 'compass-outline':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill="none" {...strokeProps} />
          <Path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" fill="none" {...strokeProps} />
        </>
      );
    case 'sparkles':
    case 'sparkles-outline':
      return (
        <>
          <Path d="M12 3l1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4L12 3Z" fill="none" {...strokeProps} />
          <Path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" fill="none" {...strokeProps} />
          <Path d="M19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" fill="none" {...strokeProps} />
        </>
      );
    case 'book':
    case 'book-outline':
      return (
        <>
          <Path d="M4.5 5.5c0-1 1-1.8 2.1-1.4L12 6v14l-5.4-1.9c-1.1-.4-2.1.4-2.1 1.4v-14Z" fill="none" {...strokeProps} />
          <Path d="M19.5 5.5c0-1-1-1.8-2.1-1.4L12 6v14l5.4-1.9c1.1-.4 2.1.4 2.1 1.4v-14Z" fill="none" {...strokeProps} />
        </>
      );
    case 'people':
    case 'people-outline':
      return (
        <>
          <Circle cx="9" cy="8" r="3" fill="none" {...strokeProps} />
          <Path d="M3.8 19c.7-3.2 2.6-5 5.2-5s4.5 1.8 5.2 5" fill="none" {...strokeProps} />
          <Circle cx="16.5" cy="9" r="2.3" fill="none" {...strokeProps} />
          <Path d="M15.2 14.2c2.1.3 3.6 1.9 4.2 4.3" fill="none" {...strokeProps} />
        </>
      );
    case 'menu-outline':
      return <><Line x1="4" y1="7" x2="20" y2="7" {...strokeProps} /><Line x1="4" y1="12" x2="20" y2="12" {...strokeProps} /><Line x1="4" y1="17" x2="20" y2="17" {...strokeProps} /></>;
    case 'notifications-outline':
      return <><Path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z" fill="none" {...strokeProps} /><Path d="M9.5 20a2.6 2.6 0 0 0 5 0" fill="none" {...strokeProps} /></>;
    case 'person-outline':
      return <><Circle cx="12" cy="8" r="4" fill="none" {...strokeProps} /><Path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" fill="none" {...strokeProps} /></>;
    case 'add-circle-outline':
      return <><Circle cx="12" cy="12" r="9" fill="none" {...strokeProps} /><Line x1="12" y1="8" x2="12" y2="16" {...strokeProps} /><Line x1="8" y1="12" x2="16" y2="12" {...strokeProps} /></>;
    case 'heart-outline':
      return <Path d="M20.5 8.8c0 5-8.5 10-8.5 10s-8.5-5-8.5-10A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.5 2.8Z" fill="none" {...strokeProps} />;
    case 'search-outline':
      return <><Circle cx="10.5" cy="10.5" r="6" fill="none" {...strokeProps} /><Line x1="15" y1="15" x2="20" y2="20" {...strokeProps} /></>;
    case 'arrow-back-outline':
      return <><Line x1="5" y1="12" x2="20" y2="12" {...strokeProps} /><Polyline points="11 6 5 12 11 18" fill="none" {...strokeProps} /></>;
    case 'chevron-forward':
      return <Polyline points="9 5 16 12 9 19" fill="none" {...strokeProps} />;
    case 'close':
      return <><Line x1="6" y1="6" x2="18" y2="18" {...strokeProps} /><Line x1="18" y1="6" x2="6" y2="18" {...strokeProps} /></>;
    case 'calendar-outline':
      return <><Rect x="4" y="5" width="16" height="16" rx="3" fill="none" {...strokeProps} /><Line x1="8" y1="3" x2="8" y2="7" {...strokeProps} /><Line x1="16" y1="3" x2="16" y2="7" {...strokeProps} /><Line x1="4" y1="10" x2="20" y2="10" {...strokeProps} /></>;
    case 'shield-half-outline':
    case 'shield-checkmark-outline':
      return <><Path d="M12 3 19 6v5.2c0 4.4-2.7 7.9-7 9.8-4.3-1.9-7-5.4-7-9.8V6l7-3Z" fill="none" {...strokeProps} /><Polyline points="8.5 12.2 11 14.6 16 9.6" fill="none" {...strokeProps} /></>;
    case 'water-outline':
    case 'water':
      return <Path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" fill="none" {...strokeProps} />;
    case 'analytics-outline':
    case 'trending-up-outline':
      return <><Polyline points="4 17 9 12 13 15 20 7" fill="none" {...strokeProps} /><Line x1="20" y1="7" x2="20" y2="13" {...strokeProps} /><Line x1="14" y1="7" x2="20" y2="7" {...strokeProps} /></>;
    case 'checkmark-circle-outline':
      return <><Circle cx="12" cy="12" r="9" fill="none" {...strokeProps} /><Polyline points="7.5 12 10.5 15 16.5 9" fill="none" {...strokeProps} /></>;
    case 'shirt-outline':
      return <Path d="M8 4 4 7l2.5 3L8 9v11h8V9l1.5 1L20 7l-4-3-2 2h-4L8 4Z" fill="none" {...strokeProps} />;
    case 'cloud-outline':
      return <Path d="M7.5 18h9a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.5 1.6A3.3 3.3 0 0 0 7.5 18Z" fill="none" {...strokeProps} />;
    case 'calculator-outline':
      return <><Rect x="6" y="3" width="12" height="18" rx="2" fill="none" {...strokeProps} /><Line x1="9" y1="8" x2="15" y2="8" {...strokeProps} /><Line x1="9" y1="13" x2="9" y2="13" {...strokeProps} /><Line x1="12" y1="13" x2="12" y2="13" {...strokeProps} /><Line x1="15" y1="13" x2="15" y2="13" {...strokeProps} /><Line x1="9" y1="17" x2="9" y2="17" {...strokeProps} /><Line x1="12" y1="17" x2="15" y2="17" {...strokeProps} /></>;
    case 'medkit-outline':
    case 'medical-outline':
      return <><Rect x="4" y="7" width="16" height="13" rx="2" fill="none" {...strokeProps} /><Path d="M9 7V5h6v2" fill="none" {...strokeProps} /><Line x1="12" y1="10" x2="12" y2="17" {...strokeProps} /><Line x1="8.5" y1="13.5" x2="15.5" y2="13.5" {...strokeProps} /></>;
    case 'speedometer-outline':
      return <><Path d="M4 15a8 8 0 1 1 16 0" fill="none" {...strokeProps} /><Line x1="12" y1="15" x2="16" y2="10" {...strokeProps} /><Line x1="7" y1="20" x2="17" y2="20" {...strokeProps} /></>;
    case 'newspaper-outline':
      return <><Rect x="4" y="5" width="16" height="14" rx="2" fill="none" {...strokeProps} /><Line x1="8" y1="9" x2="16" y2="9" {...strokeProps} /><Line x1="8" y1="13" x2="16" y2="13" {...strokeProps} /><Line x1="8" y1="16" x2="12" y2="16" {...strokeProps} /></>;
    case 'leaf-outline':
      return <><Path d="M19 5c-7 0-12 4.5-12 10a4 4 0 0 0 4 4c5.5 0 8-6 8-14Z" fill="none" {...strokeProps} /><Path d="M7 19c2.5-5 6-8 10-10" fill="none" {...strokeProps} /></>;
    case 'settings-outline':
      return <><Circle cx="12" cy="12" r="3" fill="none" {...strokeProps} /><Path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" fill="none" {...strokeProps} /></>;
    case 'logo-instagram':
    case 'logo-facebook':
    case 'logo-pinterest':
    case 'logo-youtube':
    case 'logo-tiktok':
    case 'logo-twitter':
      return <Circle cx="12" cy="12" r="8" fill={color} />;
    default:
      return <><Circle cx="12" cy="12" r="9" fill="none" {...strokeProps} /><Path d="M9.8 9a2.4 2.4 0 0 1 4.4 1.4c0 2-2.2 2.1-2.2 4" fill="none" {...strokeProps} /><Line x1="12" y1="18" x2="12" y2="18" {...strokeProps} /></>;
  }
}
