import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type ToolSlug =
  | 'besin-takvimi'
  | 'alerjen-planlayici'
  | 'bu-gida-verilir-mi'
  | 'ek-gidaya-baslama'
  | 'ek-gida-rehberi'
  | 'su-ihtiyaci'
  | 'persentil'
  | 'blw-testi'
  | 'leke-rehberi'
  | 'hava-kalitesi'
  | 'bez-hesaplayici'
  | 'hijyen-hesaplayici'
  | 'banyo-planlayici'
  | 'asi-takvimi';

export interface ToolDefinition {
  slug: ToolSlug;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Renk (ikon arka planı) — pastel + canlı eşleştirme */
  color: string;
  bg: string;
  /** Mobil rotası — yoksa null (placeholder'a düşer) */
  route: string | null;
  /** Web URL — placeholder ekranında "Web'de aç" butonu için */
  webUrl: string;
  requiresAuth?: boolean;
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'besin-takvimi',
    title: 'Besin Deneme Takvimi',
    description: 'Yeni besinleri tanıtırken takip edin ve kayıt tutun.',
    icon: 'calendar-outline',
    color: '#16A34A', bg: '#DCFCE7',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/besin-takvimi',
    requiresAuth: true,
  },
  {
    slug: 'alerjen-planlayici',
    title: 'Alerjen Deneme Planlayıcı',
    description: 'Alerjen besinleri güvenli şekilde tanıtmak için plan yapın.',
    icon: 'shield-half-outline',
    color: '#DC2626', bg: '#FEE2E2',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/alerjen-planlayici',
  },
  {
    slug: 'bu-gida-verilir-mi',
    title: 'Bu Gıda Verilir mi?',
    description: 'Bebeğinizin yaşına göre hangi gıdaları verebileceğinizi öğrenin.',
    icon: 'shield-checkmark-outline',
    color: '#16A34A', bg: '#DCFCE7',
    route: '/safety-check',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/bu-gida-verilir-mi',
  },
  {
    slug: 'ek-gidaya-baslama',
    title: 'Ek Gıdaya Başlama Kontrolü',
    description: 'Bebeğiniz ek gıdaya başlamaya hazır mı? Kontrol edin.',
    icon: 'restaurant-outline',
    color: '#F97316', bg: '#FFEDD5',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/ek-gidaya-baslama',
  },
  {
    slug: 'ek-gida-rehberi',
    title: 'Ek Gıda Rehberi',
    description: 'Bebeğiniz için yaşa özel besin grupları, porsiyon önerileri ve doku/kıvam rehberliği ile ek gıdaya güvenli geçiş.',
    icon: 'book-outline',
    color: '#0EA5E9', bg: '#E0F2FE',
    route: '/food-guide',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/ek-gida-rehberi',
  },
  {
    slug: 'su-ihtiyaci',
    title: 'Su İhtiyacı Hesaplayıcı',
    description: 'Bebeğinizin günlük su ihtiyacını yaş ve beslenme şekline göre hesaplayın.',
    icon: 'water-outline',
    color: '#06B6D4', bg: '#CFFAFE',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/su-ihtiyaci',
  },
  {
    slug: 'persentil',
    title: 'Persentil Hesaplayıcı',
    description: 'Bebeğinizin boy, kilo ve baş çevresi persentilini WHO büyüme standartlarına göre hesaplayın.',
    icon: 'analytics-outline',
    color: '#3B82F6', bg: '#DBEAFE',
    route: '/growth',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/persentil',
  },
  {
    slug: 'blw-testi',
    title: 'BLW Hazırlık Testi',
    description: "Bebeğiniz Baby-Led Weaning'e hazır mı? Hemen test edin!",
    icon: 'checkmark-circle-outline',
    color: '#7C3AED', bg: '#EDE9FE',
    route: '/blw-test',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/blw-testi',
  },
  {
    slug: 'leke-rehberi',
    title: 'Leke Ansiklopedisi',
    description: 'Bebek kıyafetlerindeki lekeleri nasıl çıkaracağınızı öğrenin.',
    icon: 'shirt-outline',
    color: '#8B5CF6', bg: '#EDE9FE',
    route: '/akilli-asistan/leke-rehberi',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/leke-rehberi',
  },
  {
    slug: 'hava-kalitesi',
    title: 'Hava Kalitesi Rehberi',
    description: 'Güncel hava kalitesine göre bebeğiniz için dış mekan aktivitesi önerileri alın.',
    icon: 'cloud-outline',
    color: '#0284C7', bg: '#E0F2FE',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/hava-kalitesi',
  },
  {
    slug: 'bez-hesaplayici',
    title: 'Akıllı Bez Hesaplayıcı',
    description: 'Bebeğinizin yaş ve kilosuna göre günlük bez ihtiyacını hesaplayın ve pişik riskini değerlendirin.',
    icon: 'calculator-outline',
    color: '#EC4899', bg: '#FCE7F3',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/bez-hesaplayici',
  },
  {
    slug: 'hijyen-hesaplayici',
    title: 'Günlük Hijyen İhtiyacı Hesaplayıcı',
    description: 'Bebeğinizin yaşına ve aktivitesine göre günlük mendil ve hijyen ürünü ihtiyacını hesaplayın.',
    icon: 'sparkles-outline',
    color: '#14B8A6', bg: '#CCFBF1',
    route: '/akilli-asistan/hijyen-hesaplayici',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/hijyen-hesaplayici',
  },
  {
    slug: 'banyo-planlayici',
    title: 'Banyo Rutini Planlayıcı',
    description: 'Bebeğiniz için mevsime göre ideal banyo sıklığını ve rutinini planlayın.',
    icon: 'water',
    color: '#0EA5E9', bg: '#E0F2FE',
    route: null,
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/banyo-planlayici',
  },
  {
    slug: 'asi-takvimi',
    title: 'Aşı Takvimi',
    description: 'Bebeğinizin aşı takvimini takip edin ve hatırlatıcılar alın.',
    icon: 'medkit-outline',
    color: '#10B981', bg: '#D1FAE5',
    route: '/vaccines',
    webUrl: 'https://kidsgourmet.com.tr/akilli-asistan/asi-takvimi',
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
