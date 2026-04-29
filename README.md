# KidsGourmet Mobile 🥗

KidsGourmet headless projesinin **React Native (Expo)** mobile versiyonu. Web projesindeki tüm tasarım anlayışı, renk paleti, API entegrasyonu ve özellikler mobile'e taşınmıştır.

## 🚀 Teknoloji Stack

| Teknoloji | Açıklama |
|-----------|----------|
| **Expo SDK 52** | React Native framework |
| **Expo Router 4** | File-based navigation |
| **NativeWind v4** | Tailwind CSS for React Native |
| **SWR** | Data fetching & caching |
| **expo-secure-store** | JWT token storage (localStorage yerine) |
| **expo-image** | Optimized image component |
| **@expo/vector-icons** | Ionicons icon set |
| **TypeScript** | Type safety |

## 🎨 Tasarım Sistemi

Web ile aynı brand renkleri:

| Renk | Hex | Kullanım |
|------|-----|----------|
| Primary | `#FF8A65` | Turuncu - ana aksiyon rengi |
| Secondary | `#AED581` | Pastel Yeşil |
| Blue | `#81D4FA` | Bebek Mavisi |
| Yellow | `#FFF176` | Sarı |
| Dark | `#455A64` | Koyu gri metin |
| Light | `#FFFBE6` | Açık sarı arka plan |
| Purple | `#B39DDB` | Mor |
| Success | `#22C55E` | Yeşil |
| Warning | `#EF4444` | Kırmızı |

## 📁 Proje Yapısı

```
app/
├── _layout.tsx              → Root layout (providers)
├── (auth)/
│   ├── _layout.tsx          → Auth stack (redirect if logged in)
│   ├── login.tsx            → Giriş ekranı
│   └── register.tsx         → Kayıt ekranı
├── (tabs)/
│   ├── _layout.tsx          → Tab navigator (5 tab)
│   ├── index.tsx            → Dashboard/Ana Sayfa
│   ├── recipes/
│   │   ├── _layout.tsx      → Recipes stack
│   │   ├── index.tsx        → Tarifler listesi
│   │   └── [slug].tsx       → Tarif detay
│   ├── favorites.tsx        → Favoriler
│   ├── meal-plan.tsx        → Haftalık Plan
│   └── profile.tsx          → Profil
└── +not-found.tsx           → 404

src/
├── lib/
│   ├── api.ts               → Fetch client (JWT via SecureStore)
│   ├── constants.ts         → API URL, endpoints, colors
│   └── types.ts             → TypeScript tipleri
├── services/                → API servisleri
│   ├── auth-service.ts
│   ├── recipe-service.ts
│   ├── user-service.ts
│   ├── favorites-service.ts
│   ├── meal-plan-service.ts
│   ├── blog-service.ts
│   ├── search-service.ts
│   ├── recommendation-service.ts
│   ├── nutrition-service.ts
│   ├── safety-service.ts
│   ├── taxonomy-service.ts
│   ├── comment-service.ts
│   ├── contact-service.ts
│   ├── ingredient-service.ts
│   ├── food-introduction-service.ts
│   ├── vaccine-service.ts
│   └── featured-service.ts
├── contexts/
│   ├── AuthContext.tsx       → JWT auth state
│   ├── ActiveChildContext.tsx → Seçili çocuk profili
│   └── FavoritesContext.tsx  → Favori tarifler
├── providers/
│   └── SWRProvider.tsx      → SWR config
├── hooks/
│   ├── use-user.ts
│   ├── useMealTypes.ts
│   ├── useMealPlan.ts
│   ├── useDashboardRecommendations.ts
│   ├── useNutritionSummary.ts
│   ├── useSafetyCheck.ts
│   └── use-blog.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   └── recipes/
│       └── RecipeCard.tsx
└── utils/
    ├── helpers.ts           → formatDuration, stripHtml, truncate
    ├── textHelpers.ts       → cleanExcerpt, slugToTitle
    ├── ageCalculator.ts     → calculateAgeInMonths/Years
    ├── ageFormatter.ts      → formatAge (Türkçe)
    └── iconHelpers.ts       → getMealTypeIcon, getSafetyIcon
```

## ⚙️ Kurulum

### Gereksinimler
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) veya Android Emulator

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local içinde EXPO_PUBLIC_API_URL'yi ayarla

# 3. Uygulamayı başlat
npx expo start

# iOS
npx expo start --ios

# Android
npx expo start --android
```

## 🔐 Kimlik Doğrulama

Web'deki `localStorage` yerine **expo-secure-store** kullanılmaktadır.
JWT token'ı şifreli şekilde cihazda saklanır.

## 🌐 Backend API

WordPress Headless CMS ile `/kg/v1/` endpoint'leri üzerinden haberleşir.
`EXPO_PUBLIC_API_URL` ortam değişkeni ile API URL'si yapılandırılır.

## Akıllı Asistan Araçları

14 tool'un tek doğruluk kaynağı `src/lib/tools.ts`.
Her tool web sürümüyle birebir aynı slug, başlık ve açıklamaya sahip.
Henüz mobil ekranı olmayan tool'lar `app/akilli-asistan/[slug].tsx` placeholder'ına düşer.
Yeni bir tool'u tam port etmek için:
1. Mobil ekranı `app/...` altında oluştur
2. `src/lib/tools.ts` içindeki ilgili kayıtta `route` alanını yeni mobil rotaya bağla

## 📱 Özellikler

- ✅ JWT Authentication (Giriş/Kayıt)
- ✅ Dashboard (önerilen tarifler, haftalık plan özeti)
- ✅ Tarifler listesi (filtreleme: yaş grubu, arama, sayfalama)
- ✅ Tarif detay (malzemeler, yapılış, besin değerleri)
- ✅ Favoriler (toggle & liste)
- ✅ Haftalık yemek planı
- ✅ Çocuk profili yönetimi
- ✅ NativeWind (Tailwind CSS) ile responsive tasarım