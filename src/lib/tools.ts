import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
  route: string;
}

export const ALL_TOOLS: Tool[] = [
  {
    id: 'allergen',
    name: 'Alerjen Planlayıcı',
    description: 'Alerjenleri takip edin ve güvenli tarifler bulun.',
    icon: 'shield-outline',
    color: '#EF4444',
    bg: '#FEF2F2',
    route: '/safety-check',
  },
  {
    id: 'food-check',
    name: 'Bu Gıda Verilir mi?',
    description: 'Herhangi bir gıdanın bebeğe uygun olup olmadığını öğrenin.',
    icon: 'search-outline',
    color: '#F59E0B',
    bg: '#FFFBEB',
    route: '/safety-check',
  },
  {
    id: 'food-intro',
    name: 'Ek Gıdaya Başlama',
    description: 'Ek gıdaya geçiş için rehber ve öneriler.',
    icon: 'restaurant-outline',
    color: '#FF8A65',
    bg: '#FFF3EE',
    route: '/food-guide',
  },
  {
    id: 'food-guide',
    name: 'Ek Gıda Rehberi',
    description: 'Hangi besin ne zaman verilmeli? Adım adım rehber.',
    icon: 'nutrition-outline',
    color: '#22C55E',
    bg: '#F0FDF4',
    route: '/food-guide',
  },
  {
    id: 'water',
    name: 'Su İhtiyacı',
    description: 'Bebeğinizin günlük su ihtiyacını hesaplayın.',
    icon: 'water-outline',
    color: '#06B6D4',
    bg: '#ECFEFF',
    route: '/food-guide',
  },
  {
    id: 'percentile',
    name: 'Persentil Hesaplayıcı',
    description: 'Boy ve kilo persentilini hesaplayın.',
    icon: 'analytics-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    route: '/growth',
  },
  {
    id: 'blw',
    name: 'BLW Hazırlık Testi',
    description: 'Bebeğiniz katı gıdaya hazır mı? Test edin.',
    icon: 'happy-outline',
    color: '#EC4899',
    bg: '#FDF2F8',
    route: '/blw-test',
  },
  {
    id: 'stain',
    name: 'Leke Ansiklopedisi',
    description: 'Her türlü lekeye karşı pratik çözümler.',
    icon: 'shirt-outline',
    color: '#6366F1',
    bg: '#EEF2FF',
    route: '/food-guide',
  },
  {
    id: 'air',
    name: 'Hava Kalitesi',
    description: 'Bulunduğunuz bölgedeki hava kalitesini öğrenin.',
    icon: 'cloud-outline',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    route: '/food-guide',
  },
  {
    id: 'diaper',
    name: 'Akıllı Bez',
    description: 'Bebek bezi takibi ve uyarı sistemi.',
    icon: 'body-outline',
    color: '#F43F5E',
    bg: '#FFF1F2',
    route: '/food-guide',
  },
  {
    id: 'hygiene',
    name: 'Günlük Hijyen',
    description: 'Bebek hijyeni için günlük rutin önerileri.',
    icon: 'hand-left-outline',
    color: '#14B8A6',
    bg: '#F0FDFA',
    route: '/food-guide',
  },
  {
    id: 'bath',
    name: 'Banyo Planlayıcı',
    description: 'Banyo rutini ve güvenli sıcaklık rehberi.',
    icon: 'water-outline',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: '/food-guide',
  },
  {
    id: 'vaccine',
    name: 'Aşı Takvimi',
    description: 'Aşı zamanlamalarını takip edin ve hatırlatıcılar alın.',
    icon: 'medkit-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    route: '/vaccines',
  },
  {
    id: 'serving',
    name: 'Sunum Önerileri',
    description: 'Yaşa göre en iyi sunum şekillerini öğrenin.',
    icon: 'fast-food-outline',
    color: '#EAB308',
    bg: '#FEFCE8',
    route: '/food-guide',
  },
  {
    id: 'three-day',
    name: '3 Gün Kuralı',
    description: 'Yeni gıdalarda 3 gün bekleme kuralını takip edin.',
    icon: 'time-outline',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    route: '/food-guide',
  },
  {
    id: 'trial',
    name: 'Besin Deneme Takvimi',
    description: 'Yeni gıda denemelerini planlayın ve kaydedin.',
    icon: 'leaf-outline',
    color: '#84CC16',
    bg: '#F7FEE7',
    route: '/food-guide',
  },
];

/** Fisher-Yates shuffle returning first `n` items */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
