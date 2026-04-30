import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faSearch,
  faShirt,
  faTriangleExclamation,
  faLightbulb,
  faBox,
  faListOl,
  faShare,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationCircle,
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

library.add(
  faArrowLeft,
  faSearch,
  faShirt,
  faTriangleExclamation,
  faLightbulb,
  faBox,
  faListOl,
  faShare,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationCircle,
  faChevronRight,
  faChevronLeft,
);

const ICON_MAP: Record<string, IconDefinition> = {
  'arrow-left': faArrowLeft,
  'search': faSearch,
  'shirt': faShirt,
  'triangle-exclamation': faTriangleExclamation,
  'lightbulb': faLightbulb,
  'box': faBox,
  'list-ol': faListOl,
  'share': faShare,
  'times': faTimes,
  'check-circle': faCheckCircle,
  'info-circle': faInfoCircle,
  'exclamation-circle': faExclamationCircle,
  'chevron-right': faChevronRight,
  'chevron-left': faChevronLeft,
};

export interface IconProps {
  name: keyof typeof ICON_MAP;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = '#475569' }: IconProps) {
  const icon = ICON_MAP[name];
  if (!icon) return null;
  return (
    <FontAwesomeIcon
      icon={icon}
      size={size}
      color={color}
    />
  );
}
