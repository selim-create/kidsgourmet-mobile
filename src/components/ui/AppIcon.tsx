import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

export type AppIconName = string;

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppIcon({ name, size = 20, color = '#111827', style }: AppIconProps) {
  const safeName = String(name || 'ellipse');
  const icon = renderIcon(safeName, color);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {icon}
      </Svg>
    </View>
  );
}

function normalizeIconName(name: string) {
  return name
    .toLowerCase()
    .replace(/-(outline|sharp)$/g, '')
    .replace(/^ios-/, '')
    .replace(/^md-/, '');
}

function stroke(color: string, width = 2) {
  return {
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
}

function social(label: string, color: string) {
  return (
    <>
      <Circle cx="12" cy="12" r="9" fill={color} />
      <SvgText
        x="12"
        y="15"
        fontSize={label.length > 1 ? 7 : 10}
        fontWeight="700"
        fill="#fff"
        textAnchor="middle"
      >
        {label}
      </SvgText>
    </>
  );
}

function renderIcon(name: string, color: string) {
  const key = normalizeIconName(name);
  const s = stroke(color);

  switch (key) {
    case 'home':
      return <><Path d="M3 11.5 12 4l9 7.5" {...s} /><Path d="M5.5 10.5V20h4.2v-5.4h4.6V20h4.2v-9.5" {...s} /></>;

    case 'restaurant':
    case 'fast-food':
    case 'nutrition':
    case 'pizza':
    case 'cafe':
      return <><Line x1="7" y1="3.5" x2="7" y2="20.5" {...s} /><Line x1="4.5" y1="3.5" x2="4.5" y2="9" {...s} /><Line x1="9.5" y1="3.5" x2="9.5" y2="9" {...s} /><Path d="M4.5 9h5" {...s} /><Path d="M17 3.5c-2.2 1.9-3.2 4.2-3.2 7.1 0 1.4.9 2.2 2.2 2.4v7.5" {...s} /><Path d="M17 3.5v17" {...s} /></>;

    case 'compass':
      return <><Circle cx="12" cy="12" r="9" {...s} /><Path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" {...s} /></>;

    case 'sparkles':
    case 'star':
      return <><Path d="M12 3l1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4L12 3Z" {...s} /><Path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" {...s} /></>;

    case 'book':
    case 'library':
      return <><Path d="M4.5 5.5c0-1 1-1.8 2.1-1.4L12 6v14l-5.4-1.9c-1.1-.4-2.1.4-2.1 1.4v-14Z" {...s} /><Path d="M19.5 5.5c0-1-1-1.8-2.1-1.4L12 6v14l5.4-1.9c1.1-.4 2.1.4 2.1 1.4v-14Z" {...s} /></>;

    case 'people':
    case 'person-add':
    case 'person-circle':
    case 'person':
      return <><Circle cx="12" cy="8" r="4" {...s} /><Path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" {...s} /></>;

    case 'menu':
      return <><Line x1="4" y1="7" x2="20" y2="7" {...s} /><Line x1="4" y1="12" x2="20" y2="12" {...s} /><Line x1="4" y1="17" x2="20" y2="17" {...s} /></>;

    case 'notifications':
    case 'notification':
      return <><Path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z" {...s} /><Path d="M9.5 20a2.6 2.6 0 0 0 5 0" {...s} /></>;

    case 'add-circle':
    case 'add':
      return <><Circle cx="12" cy="12" r="9" {...s} /><Line x1="12" y1="8" x2="12" y2="16" {...s} /><Line x1="8" y1="12" x2="16" y2="12" {...s} /></>;

    case 'heart':
    case 'heart-circle':
      return <Path d="M20.5 8.8c0 5-8.5 10-8.5 10s-8.5-5-8.5-10A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.5 2.8Z" {...s} />;

    case 'search':
      return <><Circle cx="10.5" cy="10.5" r="6" {...s} /><Line x1="15" y1="15" x2="20" y2="20" {...s} /></>;

    case 'arrow-back':
    case 'chevron-back':
    case 'caret-back':
      return <><Line x1="5" y1="12" x2="20" y2="12" {...s} /><Polyline points="11 6 5 12 11 18" {...s} /></>;

    case 'arrow-forward':
    case 'chevron-forward':
    case 'caret-forward':
      return <Polyline points="9 5 16 12 9 19" {...s} />;

    case 'chevron-down':
      return <Polyline points="6 9 12 15 18 9" {...s} />;

    case 'chevron-up':
      return <Polyline points="6 15 12 9 18 15" {...s} />;

    case 'close':
    case 'close-circle':
      return <><Line x1="6" y1="6" x2="18" y2="18" {...s} /><Line x1="18" y1="6" x2="6" y2="18" {...s} /></>;

    case 'calendar':
      return <><Rect x="4" y="5" width="16" height="16" rx="3" {...s} /><Line x1="8" y1="3" x2="8" y2="7" {...s} /><Line x1="16" y1="3" x2="16" y2="7" {...s} /><Line x1="4" y1="10" x2="20" y2="10" {...s} /></>;

    case 'shield':
    case 'shield-half':
    case 'shield-checkmark':
      return <><Path d="M12 3 19 6v5.2c0 4.4-2.7 7.9-7 9.8-4.3-1.9-7-5.4-7-9.8V6l7-3Z" {...s} /><Polyline points="8.5 12.2 11 14.6 16 9.6" {...s} /></>;

    case 'water':
    case 'waterdrop':
      return <Path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" {...s} />;

    case 'analytics':
    case 'trending-up':
    case 'stats-chart':
    case 'bar-chart':
      return <><Polyline points="4 17 9 12 13 15 20 7" {...s} /><Line x1="20" y1="7" x2="20" y2="13" {...s} /><Line x1="14" y1="7" x2="20" y2="7" {...s} /></>;

    case 'checkmark-circle':
    case 'checkmark':
      return <><Circle cx="12" cy="12" r="9" {...s} /><Polyline points="7.5 12 10.5 15 16.5 9" {...s} /></>;

    case 'shirt':
      return <Path d="M8 4 4 7l2.5 3L8 9v11h8V9l1.5 1L20 7l-4-3-2 2h-4L8 4Z" {...s} />;

    case 'cloud':
      return <Path d="M7.5 18h9a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.5 1.6A3.3 3.3 0 0 0 7.5 18Z" {...s} />;

    case 'calculator':
      return <><Rect x="6" y="3" width="12" height="18" rx="2" {...s} /><Line x1="9" y1="8" x2="15" y2="8" {...s} /><Circle cx="9" cy="13" r=".4" fill={color} /><Circle cx="12" cy="13" r=".4" fill={color} /><Circle cx="15" cy="13" r=".4" fill={color} /><Line x1="9" y1="17" x2="15" y2="17" {...s} /></>;

    case 'medkit':
    case 'medical':
      return <><Rect x="4" y="7" width="16" height="13" rx="2" {...s} /><Path d="M9 7V5h6v2" {...s} /><Line x1="12" y1="10" x2="12" y2="17" {...s} /><Line x1="8.5" y1="13.5" x2="15.5" y2="13.5" {...s} /></>;

    case 'speedometer':
      return <><Path d="M4 15a8 8 0 1 1 16 0" {...s} /><Line x1="12" y1="15" x2="16" y2="10" {...s} /><Line x1="7" y1="20" x2="17" y2="20" {...s} /></>;

    case 'newspaper':
    case 'document-text':
      return <><Rect x="4" y="5" width="16" height="14" rx="2" {...s} /><Line x1="8" y1="9" x2="16" y2="9" {...s} /><Line x1="8" y1="13" x2="16" y2="13" {...s} /><Line x1="8" y1="16" x2="12" y2="16" {...s} /></>;

    case 'leaf':
    case 'flower':
    case 'rose':
      return <><Path d="M19 5c-7 0-12 4.5-12 10a4 4 0 0 0 4 4c5.5 0 8-6 8-14Z" {...s} /><Path d="M7 19c2.5-5 6-8 10-10" {...s} /></>;

    case 'settings':
    case 'options':
      return <><Circle cx="12" cy="12" r="3" {...s} /><Path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" {...s} /></>;

    case 'filter':
    case 'funnel':
      return <Path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" {...s} />;

    case 'swap-vertical':
    case 'reorder':
    case 'sort':
      return <><Polyline points="8 4 5 7 8 10" {...s} /><Line x1="5" y1="7" x2="17" y2="7" {...s} /><Polyline points="16 14 19 17 16 20" {...s} /><Line x1="7" y1="17" x2="19" y2="17" {...s} /></>;

    case 'share':
    case 'share-social':
      return <><Circle cx="18" cy="5" r="3" {...s} /><Circle cx="6" cy="12" r="3" {...s} /><Circle cx="18" cy="19" r="3" {...s} /><Line x1="8.6" y1="10.6" x2="15.4" y2="6.4" {...s} /><Line x1="8.6" y1="13.4" x2="15.4" y2="17.6" {...s} /></>;

    case 'thumbs-up':
    case 'happy':
      return <><Path d="M8 11v9H4v-9h4Z" {...s} /><Path d="M8 11l4-7c.7-1.2 2.5-.7 2.5.7V9H19c1.2 0 2.1 1 1.9 2.2l-1.1 6.2A3 3 0 0 1 16.9 20H8" {...s} /></>;

    case 'thumbs-down':
    case 'sad':
      return <><Path d="M8 13V4H4v9h4Z" {...s} /><Path d="M8 13l4 7c.7 1.2 2.5.7 2.5-.7V15H19c1.2 0 2.1-1 1.9-2.2l-1.1-6.2A3 3 0 0 0 16.9 4H8" {...s} /></>;

    case 'chatbubble':
    case 'chatbubbles':
    case 'chatbox':
    case 'comment':
      return <><Path d="M5 6h14v9H9l-4 4V6Z" {...s} /><Line x1="8" y1="10" x2="16" y2="10" {...s} /><Line x1="8" y1="13" x2="13" y2="13" {...s} /></>;

    case 'time':
    case 'alarm':
      return <><Circle cx="12" cy="12" r="9" {...s} /><Path d="M12 7v5l3 2" {...s} /></>;

    case 'open':
    case 'link':
      return <><Path d="M14 4h6v6" {...s} /><Path d="M20 4 10 14" {...s} /><Path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" {...s} /></>;

    case 'mail':
      return <><Rect x="4" y="6" width="16" height="12" rx="2" {...s} /><Path d="m4 8 8 5 8-5" {...s} /></>;

    case 'lock-closed':
    case 'lock':
      return <><Rect x="5" y="10" width="14" height="10" rx="2" {...s} /><Path d="M8 10V7a4 4 0 0 1 8 0v3" {...s} /></>;

    case 'eye':
      return <><Path d="M3 12s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6Z" {...s} /><Circle cx="12" cy="12" r="2.5" {...s} /></>;

    case 'eye-off':
      return <><Path d="M4 4l16 16" {...s} /><Path d="M9.5 5.5A9.8 9.8 0 0 1 12 5c5.7 0 9 7 9 7a15 15 0 0 1-3.2 4.2" {...s} /><Path d="M6.5 7.5A15.2 15.2 0 0 0 3 12s3.3 7 9 7c1 0 1.9-.2 2.7-.5" {...s} /></>;

    case 'camera':
    case 'image':
      return <><Rect x="4" y="6" width="16" height="14" rx="3" {...s} /><Circle cx="12" cy="13" r="3" {...s} /><Path d="M9 6l1.2-2h3.6L15 6" {...s} /></>;

    case 'basket':
    case 'bag':
    case 'cart':
      return <><Path d="M5 9h14l-1.5 11h-11L5 9Z" {...s} /><Path d="M9 9a3 3 0 0 1 6 0" {...s} /></>;

    case 'fish':
      return <><Path d="M4 12s4-5 10-5 7 5 7 5-1 5-7 5-10-5-10-5Z" {...s} /><Path d="M4 12 2 9v6l2-3Z" {...s} /><Circle cx="16" cy="11" r=".6" fill={color} /></>;

    case 'egg':
      return <Path d="M12 3c4 0 7 5 7 10a7 7 0 0 1-14 0c0-5 3-10 7-10Z" {...s} />;

    case 'sunny':
      return <><Circle cx="12" cy="12" r="4" {...s} /><Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...s} /></>;

    case 'snow':
    case 'snowflake':
      return <><Path d="M12 3v18M5 7l14 10M19 7 5 17" {...s} /></>;

    case 'flame':
      return <Path d="M12 22c-3.6 0-6-2.4-6-5.8 0-2.7 1.5-4.8 4.5-7.1.2 2 1 3.2 2.3 4.2.2-3 1.4-5.3 3.7-7.3.7 2.1 1.5 3.7 2.2 5.3.8 1.6 1.3 3 1.3 4.8 0 3.5-2.4 5.9-8 5.9Z" {...s} />;

    case 'ribbon':
    case 'medal':
    case 'school':
      return <><Circle cx="12" cy="8" r="4" {...s} /><Path d="M9 12 7 21l5-3 5 3-2-9" {...s} /></>;

    case 'logo-instagram':
      return social('IG', color);
    case 'logo-facebook':
      return social('f', color);
    case 'logo-pinterest':
      return social('P', color);
    case 'logo-youtube':
      return social('▶', color);
    case 'logo-tiktok':
      return social('♪', color);
    case 'logo-twitter':
    case 'logo-x':
      return social('X', color);
    case 'logo-google':
      return social('G', color);
    case 'logo-apple':
      return social('', color);

    default:
      return <><Circle cx="12" cy="12" r="8" {...s} /><Circle cx="12" cy="12" r="2" fill={color} /></>;
  }
}
