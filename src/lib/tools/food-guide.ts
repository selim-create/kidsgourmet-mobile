/**
 * src/lib/tools/food-guide.ts
 *
 * Pure TypeScript business logic for the "Ek Gıda Rehberi" tool.
 * No React runtime imports — fully testable in isolation.
 *
 * Data sources: WHO Complementary Feeding Guidelines, AAP (2023),
 * Türk Pediatri Derneği Tamamlayıcı Beslenme Rehberi.
 */

// ─── Age Range Types ──────────────────────────────────────────────────────────

export type AgeRangeSlug =
  | '6-9-ay'
  | '9-12-ay'
  | '12-18-ay'
  | '18-24-ay'
  | '2-3-yas';

export interface AgeRange {
  slug: AgeRangeSlug;
  /** Display label */
  label: string;
  /** Minimum age in months (inclusive) */
  minMonths: number;
  /** Maximum age in months (exclusive) */
  maxMonths: number;
  /** Short emoji hint for the age stage */
  emoji: string;
}

// ─── Food Group Types ─────────────────────────────────────────────────────────

export type FoodGroupSlug =
  | 'tahillar'
  | 'sebzeler'
  | 'meyveler'
  | 'protein'
  | 'sut-urunleri'
  | 'saglikli-yaglar';

export interface FoodGroupEntry {
  groupSlug: FoodGroupSlug;
  /** Food examples for this age range */
  examples: string[];
  /** Recommended portion size (human-readable) */
  portion: string;
  /** Frequency per day */
  frequency: string;
  /** Preparation/texture note */
  note: string;
}

export interface AgeRangePlan {
  ageSlug: AgeRangeSlug;
  /** Key milestone summary for this stage */
  milestone: string;
  /** Meal frequency per day (meals + snacks) */
  mealPattern: string;
  /** Breast-milk / formula guidance */
  milkGuidance: string;
  foodGroups: FoodGroupEntry[];
}

// ─── Texture / Consistency Types ──────────────────────────────────────────────

export interface TextureStage {
  ageSlug: AgeRangeSlug;
  label: string;
  description: string;
  /** Brief preparation examples */
  examples: string[];
  /** Progress percentage (0-100) for the progress bar */
  progress: number;
  color: string;
}

// ─── Allergen Introduction Types ──────────────────────────────────────────────

export type AllergenUrgency = 'info' | 'caution' | 'danger';

export interface AllergenEntry {
  name: string;
  minAgeLabel: string;
  /** Earliest age (months) to introduce */
  minAgeMonths: number;
  note: string;
  urgency: AllergenUrgency;
}

// ─── Tip / Warning Types ──────────────────────────────────────────────────────

export type TipVariant = 'tip' | 'warning' | 'info' | 'danger';

export interface Tip {
  variant: TipVariant;
  text: string;
}

// ─── Data: Age Ranges ─────────────────────────────────────────────────────────

export const AGE_RANGES: AgeRange[] = [
  { slug: '6-9-ay',   label: '6-9 Ay',    minMonths: 6,  maxMonths: 9,  emoji: '🌱' },
  { slug: '9-12-ay',  label: '9-12 Ay',   minMonths: 9,  maxMonths: 12, emoji: '🥣' },
  { slug: '12-18-ay', label: '12-18 Ay',  minMonths: 12, maxMonths: 18, emoji: '🍽️' },
  { slug: '18-24-ay', label: '18-24 Ay',  minMonths: 18, maxMonths: 24, emoji: '🥗' },
  { slug: '2-3-yas',  label: '2-3 Yaş',   minMonths: 24, maxMonths: 36, emoji: '🍴' },
];

// ─── Data: Food Group Definitions ─────────────────────────────────────────────

export const FOOD_GROUPS: Record<FoodGroupSlug, { name: string; icon: string; color: string; bg: string }> = {
  tahillar: {
    name: 'Tahıllar & Ekmek',
    icon: '🌾',
    color: '#CA8A04',
    bg: '#FEF9C3',
  },
  sebzeler: {
    name: 'Sebzeler',
    icon: '🥦',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  meyveler: {
    name: 'Meyveler',
    icon: '🍎',
    color: '#EA580C',
    bg: '#FFEDD5',
  },
  protein: {
    name: 'Et, Balık & Baklagiller',
    icon: '🥩',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  'sut-urunleri': {
    name: 'Süt Ürünleri',
    icon: '🧀',
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
  'saglikli-yaglar': {
    name: 'Sağlıklı Yağlar',
    icon: '🫒',
    color: '#65A30D',
    bg: '#ECFCCB',
  },
};

// ─── Data: Age-Range Plans ────────────────────────────────────────────────────

export const AGE_RANGE_PLANS: Record<AgeRangeSlug, AgeRangePlan> = {
  '6-9-ay': {
    ageSlug: '6-9-ay',
    milestone: 'Ek gıdaya başlangıç dönemi. Beyin ve bağışıklık sistemi gelişimi için kritik pencere.',
    mealPattern: 'Günde 2-3 öğün ek gıda + anne sütü / mamaya devam',
    milkGuidance: 'Anne sütü / mama hâlâ birincil beslenme kaynağı — ek gıda tamamlayıcı.',
    foodGroups: [
      {
        groupSlug: 'tahillar',
        examples: ['Pirinç lapası', 'Yulaf lapası', 'Bebek maması (tahıllı)'],
        portion: '2-4 yemek kaşığı (30-60 ml)',
        frequency: 'Günde 2-3 kez',
        note: 'Pürüzsüz kıvamda; su veya anne sütü ile sulandırın. Tuzsuz pişirin.',
      },
      {
        groupSlug: 'sebzeler',
        examples: ['Havuç', 'Balkabağı', 'Tatlı patates', 'Bezelye', 'Patates', 'Brokoli'],
        portion: '2-4 yemek kaşığı (30-60 ml)',
        frequency: 'Günde 1-2 kez',
        note: 'Buharda pişirip pürüzsüz püre yapın. Her seferinde tek bir sebze deneyin.',
      },
      {
        groupSlug: 'meyveler',
        examples: ['Elma', 'Armut', 'Muz', 'Şeftali', 'Kavun', 'Erik'],
        portion: '2-4 yemek kaşığı (30-60 ml)',
        frequency: 'Günde 1-2 kez',
        note: 'Çiğ ezilmiş ya da buharda pişirilmiş püre. Narenciye 8-9 aydan sonra.',
      },
      {
        groupSlug: 'protein',
        examples: ['Kırmızı mercimek (8+ ay)', 'Tavuk (8+ ay)', 'Kırmızı et (8+ ay)'],
        portion: '1-2 yemek kaşığı (15-30 ml)',
        frequency: 'Günde 1 kez (8. aydan itibaren)',
        note: 'İyi pişirilmiş; pürüzsüz püre. Balık ve yumurta 8-10. ayda dikkatli tanıtın.',
      },
      {
        groupSlug: 'sut-urunleri',
        examples: ['Anne sütü (birincil)', 'Mama (ikincil)'],
        portion: 'Talep kadar / önerilen mama miktarı',
        frequency: 'Günde 4-5 emzirme veya 500-700 ml mama',
        note: '6-9. ayda yoğurt tanıtılabilir (2-3 yemek kaşığı). İnek sütü henüz içecek olarak verilmez.',
      },
      {
        groupSlug: 'saglikli-yaglar',
        examples: ['Zeytinyağı (pişirmede)', 'Avokado (püre)'],
        portion: '1 çay kaşığı',
        frequency: 'Günde 1-2 kez yemeklere ekleyerek',
        note: 'Beyin gelişimi için omega-3 ve sağlıklı yağlar önemlidir. Tuz ve baharat eklemeyin.',
      },
    ],
  },

  '9-12-ay': {
    ageSlug: '9-12-ay',
    milestone: 'Parmak besinlerine ve fincan kullanımına geçiş. Aile sofrası alışkanlığı başlıyor.',
    mealPattern: 'Günde 3-4 öğün ek gıda + anne sütü / mamaya devam',
    milkGuidance: 'Anne sütü / mama önemini korur. Açık fincanla su önerilir.',
    foodGroups: [
      {
        groupSlug: 'tahillar',
        examples: ['Pirinç', 'Yulaf', 'Tam buğday ekmeği (küçük parça)', 'Makarna', 'İrmik'],
        portion: '1/4 - 1/3 su bardağı (60-80 ml)',
        frequency: 'Günde 3-4 kez',
        note: 'Yumuşak parçalı veya ezilmiş; artık tam pürüzsüz olması gerekmez.',
      },
      {
        groupSlug: 'sebzeler',
        examples: ['Havuç', 'Balkabağı', 'Brokoli', 'Ispanak', 'Kabak', 'Tatlı mısır'],
        portion: '3-4 yemek kaşığı (45-60 ml)',
        frequency: 'Günde 2-3 kez',
        note: 'İnce doğranmış ya da yumuşak haşlanmış parçalar. Parmak besin olarak verilebilir.',
      },
      {
        groupSlug: 'meyveler',
        examples: ['Elma', 'Armut', 'Muz', 'Üzüm (dörde bölünmüş)', 'Çilek', 'Kivi'],
        portion: '3-4 yemek kaşığı (45-60 ml)',
        frequency: 'Günde 2 kez',
        note: 'Küçük yumuşak parçalar halinde verilebilir. Kabuk soyulmalı.',
      },
      {
        groupSlug: 'protein',
        examples: ['Tavuk', 'Hindi', 'Kırmızı et', 'Balık (kılçıksız)', 'Yumurta (sarısı ve akı)', 'Mercimek', 'Nohut'],
        portion: '2-3 yemek kaşığı (30-45 ml)',
        frequency: 'Günde 1-2 kez',
        note: 'İyi pişirilmiş, ezilmiş ya da küçük parçalar. Balık haftada 1-2 kez.',
      },
      {
        groupSlug: 'sut-urunleri',
        examples: ['Anne sütü / mama', 'Tam yağlı yoğurt', 'Tam yağlı lor peyniri'],
        portion: 'Yoğurt: 4-6 yemek kaşığı (60-90 ml)',
        frequency: 'Günde 1-2 kez (yoğurt/peynir)',
        note: 'İnek sütü yoğurt/peynir olarak verilir; ana içecek olarak henüz değil.',
      },
      {
        groupSlug: 'saglikli-yaglar',
        examples: ['Zeytinyağı', 'Tereyağı (az miktarda)', 'Avokado'],
        portion: '1 çay kaşığı',
        frequency: 'Her öğüne katarak',
        note: 'Sağlıklı yağlar nörolojik gelişimi destekler.',
      },
    ],
  },

  '12-18-ay': {
    ageSlug: '12-18-ay',
    milestone: 'Aile sofrasına tam katılım. Kaşık kullanımı gelişiyor; iştahsızlık dönemleri normal.',
    mealPattern: 'Günde 3 ana öğün + 1-2 ara öğün',
    milkGuidance: '2. yaşa kadar anne sütü önerilir. İnek sütü: günde 350-500 ml (içecek olarak başlanabilir).',
    foodGroups: [
      {
        groupSlug: 'tahillar',
        examples: ['Pirinç', 'Makarna', 'Tam buğday ekmeği', 'Yulaf ezmesi', 'Bulgur', 'Mısır ekmeği'],
        portion: '1/3 - 1/2 su bardağı (80-120 ml)',
        frequency: 'Her öğünde',
        note: 'Aile yemekleri uygun. Tuzu azaltın; şekerli tahıl ürünlerinden kaçının.',
      },
      {
        groupSlug: 'sebzeler',
        examples: ['Her türlü sebze', 'Ispanak', 'Brokoli', 'Havuç', 'Domates', 'Biber'],
        portion: '1/4 - 1/3 su bardağı (60-80 ml)',
        frequency: 'Günde 2-3 kez',
        note: 'Yumuşak pişirilmiş; salata form 18+ ay uygundur.',
      },
      {
        groupSlug: 'meyveler',
        examples: ['Her türlü meyve', 'Çilek', 'Yaban mersini', 'Kivi', 'Mango'],
        portion: '1/4 - 1/3 su bardağı (60-80 ml)',
        frequency: 'Günde 2 kez',
        note: 'Küçük parçalar hâlinde veya bütün (yumuşaksa). Meyve suyu önerilmez.',
      },
      {
        groupSlug: 'protein',
        examples: ['Kırmızı et', 'Tavuk', 'Balık', 'Yumurta', 'Kuru baklagiller', 'Tofu'],
        portion: '30-45 g pişmiş et / 1 yumurta',
        frequency: 'Günde 1-2 kez',
        note: 'Yumuşak, iyi pişirilmiş. Balık haftada 2 kez. Günde 1 yumurta uygundur.',
      },
      {
        groupSlug: 'sut-urunleri',
        examples: ['Tam yağlı inek sütü', 'Yoğurt', 'Peynir', 'Kefir'],
        portion: 'Süt: 120-180 ml; Yoğurt: 1/2 su bardağı',
        frequency: 'Günde 2-3 kez',
        note: 'Tam yağlı süt ürünleri tercih edin. Günde 350-500 ml süt/süt ürünü yeterli.',
      },
      {
        groupSlug: 'saglikli-yaglar',
        examples: ['Zeytinyağı', 'Avokado', 'Fındık ezmesi (ince)', 'Tereyağı'],
        portion: '1-2 çay kaşığı',
        frequency: 'Her öğünde',
        note: 'Yağlar beyin gelişimi ve yağda çözünen vitaminler (A, D, E, K) için gereklidir.',
      },
    ],
  },

  '18-24-ay': {
    ageSlug: '18-24-ay',
    milestone: 'Bağımsız yeme gelişiyor. Seçici yeme davranışları doruk noktasında olabilir.',
    mealPattern: 'Günde 3 ana öğün + 2 ara öğün',
    milkGuidance: 'Anne sütü devam edebilir. İnek sütü: günde 300-400 ml yeterli.',
    foodGroups: [
      {
        groupSlug: 'tahillar',
        examples: ['Tam tahıllı ekmek', 'Pirinç', 'Makarna', 'Yulaf', 'Bulgur', 'Kinoa'],
        portion: '1/2 su bardağı (120 ml) / 1-2 dilim ekmek',
        frequency: 'Her öğünde',
        note: 'Tam tahıllı seçenekleri tercih edin. Şekerli tahıllar sınırlı tutulmalı.',
      },
      {
        groupSlug: 'sebzeler',
        examples: ['Her türlü sebze (çiğ veya pişmiş)', 'Mısır', 'Bezelye', 'Havuç'],
        portion: '1/3 - 1/2 su bardağı (80-120 ml)',
        frequency: 'Günde 2-3 kez',
        note: 'Reddedilen sebzeyi farklı şekillerde sunun. 10-15 deneme normaldir.',
      },
      {
        groupSlug: 'meyveler',
        examples: ['Her türlü taze meyve', 'Kuru meyve (az miktarda)', 'Mevsim meyveleri'],
        portion: '1/3 - 1/2 su bardağı (80-120 ml)',
        frequency: 'Günde 2 kez',
        note: 'Taze meyveyi tercih edin. Meyve suyu günde 120 ml\'yi geçmemeli.',
      },
      {
        groupSlug: 'protein',
        examples: ['Kırmızı et', 'Tavuk', 'Balık', 'Yumurta', 'Baklagiller', 'Fındık ezmeleri'],
        portion: '45-60 g pişmiş et / 1-2 yumurta',
        frequency: 'Günde 2 kez',
        note: 'Balık haftada 2 kez. Fındık ezmesi ekmeğe sürülebilir.',
      },
      {
        groupSlug: 'sut-urunleri',
        examples: ['Tam yağlı inek sütü', 'Yoğurt', 'Peynir', 'Ayran'],
        portion: 'Süt: 150-200 ml; Yoğurt: 3/4 su bardağı',
        frequency: 'Günde 2-3 kez',
        note: 'Toplam süt tüketimi 300-400 ml/gün. Fazlası demir emilimini azaltabilir.',
      },
      {
        groupSlug: 'saglikli-yaglar',
        examples: ['Zeytinyağı', 'Avokado', 'Fındık ve badem ezmesi', 'Susam (tahin)'],
        portion: '1-2 çay kaşığı',
        frequency: 'Her öğünde',
        note: 'Düşük yağlı ürünler 2 yaş öncesi önerilmez.',
      },
    ],
  },

  '2-3-yas': {
    ageSlug: '2-3-yas',
    milestone: 'Aile yemeklerine tam geçiş. Motor beceriler gelişiyor, kaşık-çatal kullanımı ilerliyor.',
    mealPattern: 'Günde 3 ana öğün + 1-2 ara öğün',
    milkGuidance: 'İnek sütü veya zenginleştirilmiş bitkisel süt: günde 250-350 ml.',
    foodGroups: [
      {
        groupSlug: 'tahillar',
        examples: ['Tam tahıllı ekmek', 'Pirinç', 'Makarna', 'Bulgur', 'Kinoa', 'Yulaf'],
        portion: '1/2 - 3/4 su bardağı (120-180 ml)',
        frequency: 'Her öğünde',
        note: 'Aile yemekleri uygundur. Rafine unlu ürünler sınırlı tutulmalı.',
      },
      {
        groupSlug: 'sebzeler',
        examples: ['Her türlü sebze', 'Salata (ince kesilmiş)', 'Çiğ sebzeler (küçük parçalar)'],
        portion: '1/2 su bardağı (120 ml)',
        frequency: 'Günde 3 kez',
        note: 'Rengarenk tabak hazırlayın. Çiğ havuç, salatalık gibi sert sebzeler küçük kesilmeli.',
      },
      {
        groupSlug: 'meyveler',
        examples: ['Her türlü meyve', 'Çilek', 'Böğürtlen', 'Kivi', 'Şeftali'],
        portion: '1/2 su bardağı (120 ml)',
        frequency: 'Günde 2 kez',
        note: 'Taze meyveyi tercih edin. Üzüm ve kiraz ikiye kesilmeli (boğulma riski).',
      },
      {
        groupSlug: 'protein',
        examples: ['Kırmızı et', 'Tavuk', 'Balık', 'Yumurta', 'Kuru fasulye', 'Mercimek', 'Tofu'],
        portion: '60-75 g pişmiş et / 1-2 yumurta',
        frequency: 'Günde 2 kez',
        note: 'Çeşitli protein kaynakları sunun. Yağsız et tercih edin.',
      },
      {
        groupSlug: 'sut-urunleri',
        examples: ['Süt (tam ya da %2 yağlı)', 'Yoğurt', 'Peynir', 'Kefir'],
        portion: 'Süt: 150-200 ml',
        frequency: 'Günde 2-3 kez',
        note: '2 yaştan sonra %2 yağlı süt geçilebilir. Toplam 250-350 ml/gün yeterli.',
      },
      {
        groupSlug: 'saglikli-yaglar',
        examples: ['Zeytinyağı', 'Fındık, badem, ceviz (ince öğütülmüş/ezme)', 'Avokado', 'Tahin'],
        portion: '1-2 çay kaşığı yağ / 1-2 yemek kaşığı fındık ezmesi',
        frequency: 'Günde 1-2 kez',
        note: 'Bütün fındık ve yemişler 5 yaşından önce boğulma riski oluşturur.',
      },
    ],
  },
};

// ─── Data: Texture Stages ─────────────────────────────────────────────────────

export const TEXTURE_STAGES: TextureStage[] = [
  {
    ageSlug: '6-9-ay',
    label: 'Pürüzsüz Püre',
    description: 'Lump veya parça içermeyen, akışkan kıvamda püre. Elek veya blender ile hazırlanır.',
    examples: ['Süt/su ile sulandırılmış pirinç lapası', 'Elenmiş havuç püresi', 'Süzülmüş meyve püresi'],
    progress: 15,
    color: '#3B82F6',
  },
  {
    ageSlug: '9-12-ay',
    label: 'Parçalı / Ezilmiş',
    description: 'Çatal ile ezilmiş, küçük yumuşak parçalar içerebilir. Parmak besinlere geçiş başlar.',
    examples: ['Çatalla ezilmiş muz', 'Küp doğranmış haşlanmış havuç', 'Küçük makarna parçaları'],
    progress: 40,
    color: '#8B5CF6',
  },
  {
    ageSlug: '12-18-ay',
    label: 'Küçük Yumuşak Parçalar',
    description: 'Küçük kesilmiş ya da dişsiz çiğnenebilecek yumuşak parçalar. Aile sofrası uyarlanmış.',
    examples: ['Pişmiş makarna (bütün)', 'İnce dilimlere kesilmiş meyve', 'Küçük pirzola parçaları'],
    progress: 65,
    color: '#F97316',
  },
  {
    ageSlug: '18-24-ay',
    label: 'Aile Yemekleri (Yumuşak)',
    description: 'Düşük tuz ve baharat ile hazırlanmış aile yemekleri. Bazı yiyecekler küçük kesilir.',
    examples: ['Aile çorbası (az tuzlu)', 'Küçük kesilmiş tavuk', 'İnce dilim ekmek'],
    progress: 82,
    color: '#22C55E',
  },
  {
    ageSlug: '2-3-yas',
    label: 'Aile Yemekleri',
    description: 'Tüm aile yemekleri uygundur. Çok sert veya boğulma riski taşıyan besinler hariç.',
    examples: ['Aile sofrasındaki tüm yemekler', 'Salata (ince kesilmiş)', 'Meyve (ikiye bölünmüş)'],
    progress: 100,
    color: '#16A34A',
  },
];

// ─── Data: Allergen Introduction Schedule ─────────────────────────────────────

export const ALLERGEN_SCHEDULE: AllergenEntry[] = [
  {
    name: 'Gluten (Buğday)',
    minAgeLabel: '6. aydan itibaren',
    minAgeMonths: 6,
    note: 'Bebek maması veya pirinç/buğday lapası ile tanıtın. Gluten geç tanıtmak çölyak riskini artırmaz.',
    urgency: 'info',
  },
  {
    name: 'Yumurta',
    minAgeLabel: '8-10. aydan itibaren',
    minAgeMonths: 8,
    note: 'Önce tam pişmiş yumurta sarısı (8. ay), ardından ak (9-10. ay). 3-5 gün bekleyerek izleyin.',
    urgency: 'caution',
  },
  {
    name: 'Balık',
    minAgeLabel: '8-10. aydan itibaren',
    minAgeMonths: 8,
    note: 'Kılçıksız, iyi pişirilmiş (somon, levrek, dil balığı). Haftada 1-2 kez önerilir.',
    urgency: 'caution',
  },
  {
    name: 'Fıstık Ezmesi',
    minAgeLabel: '10-12. aydan itibaren',
    minAgeMonths: 10,
    note: 'Bütün fıstık değil, ince fıstık ezmesi (az miktarda). Aile öyküsü varsa doktora danışın.',
    urgency: 'caution',
  },
  {
    name: 'Kabuklu Deniz Ürünleri',
    minAgeLabel: '10-12. aydan itibaren',
    minAgeMonths: 10,
    note: 'İyi pişirilmiş karides, midye vb. Az miktarda ve dikkatli tanıtın.',
    urgency: 'caution',
  },
  {
    name: 'İnek Sütü (içecek olarak)',
    minAgeLabel: '12. aydan itibaren',
    minAgeMonths: 12,
    note: 'Yemeklerde 6. aydan kullanılabilir. Ana içecek olarak 12. ayda başlayın. Günde 350-500 ml.',
    urgency: 'info',
  },
  {
    name: 'Kabuklu Yemişler (Ezme)',
    minAgeLabel: '12. aydan itibaren',
    minAgeMonths: 12,
    note: 'Fındık, badem, ceviz ezmesi olarak sunun. Bütün yemişler 5 yaştan önce boğulma riski taşır.',
    urgency: 'caution',
  },
  {
    name: 'Bal',
    minAgeLabel: '12. aydan ÖNCE VERİLMEZ',
    minAgeMonths: 12,
    note: '⚠️ 12 aydan önce kesinlikle vermeyiniz! Bebek botulizmi (Clostridium botulinum) riski taşır.',
    urgency: 'danger',
  },
  {
    name: 'Tuz (ekleme)',
    minAgeLabel: '2 yaşa kadar eklenmez',
    minAgeMonths: 24,
    note: 'Bebek böbrekleri fazla tuzu işleyemez. Yiyecekler tuzsuz hazırlayın. Doğal tatlı/ekşi tatları keşfettirin.',
    urgency: 'danger',
  },
  {
    name: 'Bütün Fındık / Yemiş',
    minAgeLabel: '5 yaştan önce VERİLMEZ',
    minAgeMonths: 60,
    note: '⚠️ Boğulma riski! 5 yaşına kadar bütün fındık, fıstık, badem gibi sert yiyecekler verilmez.',
    urgency: 'danger',
  },
];

// ─── Data: Tips per Age Range ─────────────────────────────────────────────────

export const AGE_RANGE_TIPS: Record<AgeRangeSlug, Tip[]> = {
  '6-9-ay': [
    { variant: 'tip', text: 'Her yeni besini 3-5 gün boyunca tek başına verin; böylece alerjik reaksiyon takibi yapabilirsiniz.' },
    { variant: 'tip', text: 'Önce sebze püresi, ardından meyve sunmak, tatlı tercihinin önüne geçer.' },
    { variant: 'warning', text: 'Tuz, şeker ve bal 12 aya kadar kesinlikle eklemeyin.' },
    { variant: 'warning', text: 'Ana sıvı kaynağı anne sütü/mama olmalı; su veya diğer içecekler sınırlı tutulmalı.' },
    { variant: 'info', text: 'Bebek yemeği reddedebilir — bu normaldir. Yüzünü buruşturması da "beğenmedi" anlamına gelmez, yeni tatlar öğreniyor.' },
    { variant: 'info', text: 'Pişirme suları kaybolan vitamin ve mineral açısından değerlidir; mümkünse püreyebileceğiniz suyla hazırlayın.' },
  ],
  '9-12-ay': [
    { variant: 'tip', text: 'Parmak besinleri (finger foods) motor becerileri ve özgüveni geliştirir. Küçük parçalar sunun.' },
    { variant: 'tip', text: 'Açık bardaktan su içme alışkanlığına başlayın. Emzikli kaplar yerine normal bardak önerilir.' },
    { variant: 'tip', text: 'Aile sofrası ile aynı saatte oturturun — sosyalleşme ve taklit yoluyla öğrenme başlar.' },
    { variant: 'warning', text: 'Boğulma riski taşıyan besinler: üzüm (ikiye kesin), çiğ havuç, bütün fındık/yemiş, sert meyveler.' },
    { variant: 'info', text: 'Bu dönemde yemek yemenin dağınık ve uzun sürmesi normaldir. Sabırlı olun.' },
  ],
  '12-18-ay': [
    { variant: 'tip', text: 'Seçici yeme (picky eating) çoğu çocukta bu dönemde zirve yapar — normaldir, zorlamayın.' },
    { variant: 'tip', text: 'Reddedilen bir besini 10-15 farklı denemede sunmaya devam edin; çocuklar zamanla kabul eder.' },
    { variant: 'tip', text: 'Kaşık ve çatal kullanımını teşvik edin; dağınıklık bu öğrenme sürecinin parçasıdır.' },
    { variant: 'warning', text: 'Meyve suyu günde 120 ml\'yi geçmemeli; taze meyveyi tercih edin.' },
    { variant: 'info', text: 'İştah zaman zaman azalabilir — bu büyüme hızının yavaşladığı dönemlerle ilişkilidir.' },
  ],
  '18-24-ay': [
    { variant: 'tip', text: 'Çocuğunuzu yemek hazırlamaya katın (yıkama, karıştırma). Sahiplendiği yemeği daha kolay yer.' },
    { variant: 'tip', text: 'Küçük, sık öğünler büyük porsiyonlardan daha etkilidir. Abartılı porsiyon sunmayın.' },
    { variant: 'warning', text: 'Ekran karşısında yemek uzun vadede seçici yemeği artırır; yemek zamanlarını ekransız tutun.' },
    { variant: 'info', text: 'Vitamin D ve demir takviyeleri için çocuk doktorunuza danışın.' },
  ],
  '2-3-yas': [
    { variant: 'tip', text: 'Sağlıklı yeme alışkanlıkları bu dönemde şekillenir. Aile olarak sağlıklı yiyin — model olun.' },
    { variant: 'tip', text: 'Çeşitlilik anahtardır: her gün farklı renkli sebze ve meyveler sunmaya çalışın.' },
    { variant: 'warning', text: 'İşlenmiş gıda, fast food ve aşırı şekerli yiyecekler sınırlı tutulmalıdır.' },
    { variant: 'info', text: 'Atıştırmalıklar besin değeri yüksek olmalı: meyve, yoğurt, peynir, tam tahıllı atıştırmalıklar.' },
    { variant: 'info', text: 'Diş sağlığı için şekerli içecekler ve meyve suları kısıtlanmalı; su ve süt tercih edilmeli.' },
  ],
};

// ─── Data: Disclaimer / Reference ────────────────────────────────────────────

export const FOOD_GUIDE_DISCLAIMER_TITLE = '⚠️ Önemli Uyarı';

export const FOOD_GUIDE_DISCLAIMER_LINES = [
  'Bu rehber yalnızca genel bilgi amaçlıdır ve bireysel tıbbi tavsiye yerine geçmez.',
  'Her çocuğun gelişimi, alerjik durumu ve sağlık koşulları farklıdır; ek gıdaya başlamadan ve yeni besinler tanıtmadan önce çocuk doktorunuza veya diyetisyene danışın.',
  'Alerji öyküsü olan ailelerde yüksek alerjenik besinleri tanıtırken daha dikkatli olunması ve uzman görüşü alınması önerilir.',
  'Porsiyon ve sıklık bilgileri ortalama değerler olup bireysel ihtiyaçlara göre değişebilir.',
];

export const FOOD_GUIDE_REFERENCE_NOTE =
  'Veriler; Dünya Sağlık Örgütü (WHO) Tamamlayıcı Beslenme Rehberi, Amerikan Pediatri Akademisi (AAP, 2023) ve Türk Pediatri Derneği Tamamlayıcı Beslenme Kılavuzu\'na dayanmaktadır.';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Returns the best-matching AgeRange for the given age in months.
 * Returns the first range (6-9 ay) if age < 6,
 * and the last range (2-3 yaş) if age >= 36.
 */
export function getAgeRangeForMonths(ageMonths: number): AgeRange {
  for (const range of AGE_RANGES) {
    if (ageMonths >= range.minMonths && ageMonths < range.maxMonths) {
      return range;
    }
  }
  // Below 6 months → return first range; above 36 → return last range
  if (ageMonths < AGE_RANGES[0].minMonths) return AGE_RANGES[0];
  return AGE_RANGES[AGE_RANGES.length - 1];
}

/**
 * Returns the AgeRangePlan for the given slug.
 */
export function getPlanForAge(slug: AgeRangeSlug): AgeRangePlan {
  return AGE_RANGE_PLANS[slug];
}

/**
 * Returns the TextureStage for the given age slug.
 */
export function getTextureStage(slug: AgeRangeSlug): TextureStage {
  return TEXTURE_STAGES.find((s) => s.ageSlug === slug) ?? TEXTURE_STAGES[0];
}

/**
 * Returns allergen entries that are appropriate to introduce at the given age.
 * Sorted: first those whose min age ≤ ageMonths (already can introduce or should
 * have introduced), then those not yet appropriate.
 */
export function getAllergenEntriesForAge(ageMonths: number): AllergenEntry[] {
  return [...ALLERGEN_SCHEDULE].sort((a, b) => a.minAgeMonths - b.minAgeMonths);
}

/**
 * Returns tips for the given age slug.
 */
export function getTipsForAge(slug: AgeRangeSlug): Tip[] {
  return AGE_RANGE_TIPS[slug] ?? [];
}

/**
 * Returns a CSS-like color for a tip variant.
 */
export const TIP_COLORS: Record<TipVariant, { bg: string; border: string; text: string; icon: string }> = {
  tip: {
    bg: '#ECFDF5',
    border: '#059669',
    text: '#065F46',
    icon: '💡',
  },
  info: {
    bg: '#EFF6FF',
    border: '#3B82F6',
    text: '#1E40AF',
    icon: 'ℹ️',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#D97706',
    text: '#92400E',
    icon: '⚠️',
  },
  danger: {
    bg: '#FEF2F2',
    border: '#DC2626',
    text: '#991B1B',
    icon: '🚫',
  },
};

/**
 * Returns the urgency color config for an allergen entry.
 */
export const ALLERGEN_URGENCY_COLORS: Record<AllergenUrgency, { bg: string; border: string; text: string }> = {
  info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
  caution: { bg: '#FFFBEB', border: '#D97706', text: '#92400E' },
  danger: { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B' },
};
