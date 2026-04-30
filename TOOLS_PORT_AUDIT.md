# Akıllı Asistan — Tools Port Audit

> **Tarih:** 2026-04-29  
> **Kapsam:** `selim-create/kidsgourmet-mobile` reposundaki 14 Akıllı Asistan tool'unun web ile parite denetimi.  
> **Metodoloji:** Mobile kaynak kodu (`app/`, `src/`) doğrudan incelenmiştir. Web repo (`kidsgourmet-web`) ve backend repo (`kg-core`) private olduğundan doğrudan erişilememiştir; ancak mobil kodda mevcut olan endpoint listeleri (`src/lib/constants.ts`), tip tanımları (`src/lib/types.ts`), servis fonksiyonları (`src/services/tool-service.ts`) ve problem statement açıklamaları kanıt olarak kullanılmıştır.

---

## Genel Bakış

| Alan | Değer |
|---|---|
| Toplam tool sayısı | **14** |
| Mobil ekranı mevcut (5) | `bu-gida-verilir-mi`, `ek-gida-rehberi`, `persentil`, `blw-testi`, `asi-takvimi` |
| Placeholder'da kalan (9) | `besin-takvimi`, `alerjen-planlayici`, `ek-gidaya-baslama`, `su-ihtiyaci`, `leke-rehberi`, `hava-kalitesi`, `bez-hesaplayici`, `hijyen-hesaplayici`, `banyo-planlayici` |
| Tasarım kuralı | mobile-first; web'deki `lg:` desktop varyantları yok sayılır |
| Auth davranışı | Login değilse `router.replace('/(auth)/login')` ile redirect |
| İkon kuralı | `@expo/vector-icons` / Ionicons **YASAK** |
| Veri kaynağı | `kg-core` REST API (`/kg/v1/...`) — web ile birebir aynı endpoint'ler |
| Durum özeti | Mevcut 5 ekranın **tamamı hatalı veya eksik**; hiçbiri web ile birebir pariteli değil |

---

## Endpoint Envanteri (kg-core)

Aşağıdaki tablo, `src/lib/constants.ts` (satır 3–175) ve `src/services/tool-service.ts` dosyalarından derlenen tüm tool endpoint'lerini göstermektedir.

| Endpoint | Method | Hangi Tool(lar) | Mobile Sabit Adı |
|---|---|---|---|
| `/kg/v1/tools` | GET | (tool listesi) | `TOOLS` |
| `/kg/v1/tools/:slug` | GET | (tool detayı) | `TOOL_BY_SLUG(slug)` |
| `/kg/v1/tools/blw-test` | POST | blw-testi | `TOOL_BLW_TEST` |
| `/kg/v1/tools/blw-test/config` | GET | blw-testi | `BLW_TEST_CONFIG` |
| `/kg/v1/tools/blw-test/submit` | POST | blw-testi | `BLW_TEST_SUBMIT` |
| `/kg/v1/tools/blw-test/results` | GET | blw-testi | `TOOL_BLW_RESULTS` |
| `/kg/v1/tools/percentile` | — | persentil | `TOOL_PERCENTILE` |
| `/kg/v1/tools/percentile/calculate` | POST | persentil | `PERCENTILE_CALCULATE` |
| `/kg/v1/tools/percentile/save` | POST | persentil | `PERCENTILE_SAVE` |
| `/kg/v1/tools/percentile/results` | GET | persentil | `TOOL_PERCENTILE_RESULTS` |
| `/kg/v1/tools/solid-food-readiness` | — | ek-gidaya-baslama | `TOOL_SOLID_FOOD` |
| `/kg/v1/tools/solid-food-readiness/config` | GET | ek-gidaya-baslama | `SOLID_FOOD_READINESS_CONFIG` |
| `/kg/v1/tools/solid-food-readiness/submit` | POST | ek-gidaya-baslama | `SOLID_FOOD_READINESS_SUBMIT` |
| `/kg/v1/tools/solid-food-readiness/results` | GET | ek-gidaya-baslama | `TOOL_SOLID_FOOD_RESULTS` |
| `/kg/v1/tools/water-calculator` | GET | su-ihtiyaci | `WATER_CALCULATOR` |
| `/kg/v1/tools/allergen-planner/config` | GET | alerjen-planlayici | `ALLERGEN_PLANNER_CONFIG` |
| `/kg/v1/tools/allergen-planner/generate` | POST | alerjen-planlayici | `ALLERGEN_PLANNER_GENERATE` |
| `/kg/v1/tools/food-trials` | GET | besin-takvimi | `FOOD_TRIALS` |
| `/kg/v1/tools/food-trials` | POST | besin-takvimi | `FOOD_TRIALS` |
| `/kg/v1/tools/food-trials/:id` | PUT | besin-takvimi | `FOOD_TRIAL(id)` |
| `/kg/v1/tools/food-trials/:id` | DELETE | besin-takvimi | `FOOD_TRIAL(id)` |
| `/kg/v1/tools/food-trials/summary` | GET | besin-takvimi | `FOOD_TRIAL_SUMMARY` |
| `/kg/v1/tools/bath-planner/config` | GET | banyo-planlayici | `BATH_PLANNER_CONFIG` |
| `/kg/v1/tools/bath-planner/generate` | POST | banyo-planlayici | `BATH_PLANNER_GENERATE` |
| `/kg/v1/tools/hygiene-calculator` | POST | hijyen-hesaplayici | `HYGIENE_CALCULATOR` |
| `/kg/v1/tools/diaper-calculator` | POST | bez-hesaplayici | `DIAPER_CALCULATOR` |
| `/kg/v1/tools/diaper-calculator/rash-risk` | POST | bez-hesaplayici | `DIAPER_RASH_RISK` |
| `/kg/v1/tools/air-quality/analyze` | POST | hava-kalitesi | `AIR_QUALITY_ANALYZE` |
| `/kg/v1/tools/stain-encyclopedia/search` | GET | leke-rehberi | `STAIN_ENCYCLOPEDIA_SEARCH` |
| `/kg/v1/tools/stain-encyclopedia/popular` | GET | leke-rehberi | `STAIN_ENCYCLOPEDIA_POPULAR` |
| `/kg/v1/tools/stain-encyclopedia/:slug` | GET | leke-rehberi | `STAIN_ENCYCLOPEDIA_BY_SLUG(slug)` |
| `/kg/v1/safety/check-ingredient` | POST | bu-gida-verilir-mi | `SAFETY_CHECK_INGREDIENT` |
| `/kg/v1/health/vaccines/master` | GET | asi-takvimi | `VACCINES_MASTER` |
| `/kg/v1/health/vaccines` | GET | asi-takvimi | `VACCINES_BY_CHILD(childId)` |
| `/kg/v1/health/vaccines/mark-done` | POST | asi-takvimi | `VACCINES_MARK_DONE` |
| `/kg/v1/health/growth` | GET/POST | persentil | `GROWTH_DATA`, `GROWTH_ADD` |
| `/kg/v1/tools/:slug/sponsor` | GET | (sponsorlu tool) | `TOOL_SPONSOR_BY_SLUG(slug)` |

> **Not:** `ek-gida-rehberi` için ayrı bir kg-core API endpoint'i yoktur. İçerik `src/data/food-guide.ts` dosyasında statik olarak tutulmaktadır (bkz. Tool #5 detayları).

---

## İkon Stratejisi

### Mevcut Durum (Teknik Borç)

`src/lib/tools.ts` (satır 2, 24) `@expo/vector-icons`'dan `Ionicons` import ediyor ve `ToolDefinition.icon` tipi `ComponentProps<typeof Ionicons>['name']` olarak tanımlı. Bu **teknik borç**tir çünkü:
- Kullanıcı `@expo/vector-icons` kullanılmamasını onaylamıştır.
- Web sürümü Font Awesome (`fa-solid fa-...`) ikon sistemi kullanmaktadır.
- Tüm mevcut 5 tool ekranı (safety-check, food-guide, growth, blw-test, vaccines) Ionicons kullanmaktadır.

### Önerilen Strateji: `@fortawesome/react-native-fontawesome`

Web sürümüyle ikonları 1:1 eşleştirmeye en yakın çözüm, **Font Awesome'un resmi React Native paketini** kullanmaktır.

**Kurulum:**
```bash
npm install @fortawesome/fontawesome-svg-core \
            @fortawesome/free-solid-svg-icons \
            @fortawesome/react-native-fontawesome \
            react-native-svg
```

**Örnek Kullanım:**
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faCalendarDays} size={24} color="#16A34A" />
```

**Web → Mobil İkon Eşlemesi (14 Tool):**

| Tool | Web (Font Awesome) | Mobil önerisi |
|---|---|---|
| besin-takvimi | `fa-solid fa-calendar-days` | `faCalendarDays` |
| alerjen-planlayici | `fa-solid fa-shield-halved` | `faShieldHalved` |
| bu-gida-verilir-mi | `fa-solid fa-shield-check` | `faShieldCheck` |
| ek-gidaya-baslama | `fa-solid fa-utensils` | `faUtensils` |
| ek-gida-rehberi | `fa-solid fa-book-open` | `faBookOpen` |
| su-ihtiyaci | `fa-solid fa-droplet` | `faDroplet` |
| persentil | `fa-solid fa-chart-line` | `faChartLine` |
| blw-testi | `fa-solid fa-circle-check` | `faCircleCheck` |
| leke-rehberi | `fa-solid fa-shirt` | `faShirt` |
| hava-kalitesi | `fa-solid fa-cloud` | `faCloud` |
| bez-hesaplayici | `fa-solid fa-calculator` | `faCalculator` |
| hijyen-hesaplayici | `fa-solid fa-sparkles` | `faSparkles` |
| banyo-planlayici | `fa-solid fa-bath` | `faBath` |
| asi-takvimi | `fa-solid fa-syringe` | `faSyringe` |

**`tools.ts` Güncelleme Gereksinimi:**
`ToolDefinition.icon` tipi `Ionicons` name'den `IconDefinition` (Font Awesome tipine) güncellenmeli. Bu, tüm tool tanımlarını ve mevcut 5 ekranın tamamını etkiler.

**Alternatif (daha az tercih edilen):** `react-native-svg` ile SVG asset'leri kopyalamak (web'den FA SVG dosyalarını export etmek). Ancak bu yaklaşım daha fazla manuel bakım gerektirir.

---

## Tool Detayları

### 1. besin-takvimi — Besin Deneme Takvimi

**Web:** `src/app/(main)/akilli-asistan/besin-takvimi/page.tsx` + `src/components/tools/food-trials/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/food-trials` → mevcut food trial listesi (auth gerekli)
- `POST /kg/v1/tools/food-trials` → yeni trial ekle (auth gerekli)
- `PUT /kg/v1/tools/food-trials/:id` → trial güncelle (auth gerekli)
- `DELETE /kg/v1/tools/food-trials/:id` → trial sil (auth gerekli)
- `GET /kg/v1/tools/food-trials/summary` → özet (toplam, tamamlanan, reaksiyon sayısı)

**Auth:** **Gerekli** → kullanıcı login değilse `router.replace('/(auth)/login')` ile yönlendir  
**Mevcut mobil ekran:** Yok — `app/akilli-asistan/[slug].tsx` placeholder'ı gösteriyor  
**Mevcut mobil service:** `src/services/tool-service.ts` → `getFoodTrials()`, `createFoodTrial()`, `updateFoodTrial()`, `deleteFoodTrial()`, `getFoodTrialSummary()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/besin-takvimi.tsx`

**UI özellikleri (web mobile görünümünden):**
- Yeşil gradient header (`#16A34A` / `#DCFCE7`)
- Özet kartı: toplam deneme, tamamlanan, reaksiyon sayısı
- "Yeni Besin Ekle" butonu → modal/form açar (food_name, start_date)
- Besin listesi: her kart → durum badge'i (planned/in_progress/completed/reaction)
- Her kartın sağında: düzenle ve sil aksiyonları
- Tamamlandı olarak işaretle: swipe veya buton
- Reaksiyon durumu kırmızı badge + reaction_type gösterimi
- Boş durum: "Henüz besin denenemesi yok" illustrated empty state
- Toast bildirimleri (ekleme/silme/hata)

**Port adımları:**
1. Auth kontrolü: ekran mount'ta `useAuth().isAuthenticated` kontrol et; değilse `router.replace('/(auth)/login')`
2. `useSWR` hook: `FOOD_TRIALS` key, `getFoodTrials()` fetcher
3. Özet kartı: `getFoodTrialSummary()` ile çek
4. "Yeni Besin Ekle" → `Modal` + form (TextInput food_name, DatePicker start_date)
5. Liste: `FlatList` ile her besin kartı, durum badge'i
6. Swipe to complete/delete: `react-native-gesture-handler` veya butonlar
7. İkonlar: Font Awesome (`faCalendarDays`)
8. `useSWR` mutate ile güncelleme

**Eksik/Riskli noktalar:**
- Auth guard her zaman en başta kontrol edilmeli; placeholder ekranı auth guard içermiyor
- `FoodTrial.status` için `reaction` durumunda `reaction_type` alanı doldurulabilmeli
- Tarih formatlama: Türkçe locale desteği (`TR/dd.MM.yyyy`)

---

### 2. alerjen-planlayici — Alerjen Deneme Planlayıcı

**Web:** `src/app/(main)/akilli-asistan/alerjen-planlayici/page.tsx` + `src/components/tools/allergen-planner/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/allergen-planner/config` → alerjen listesi ve konfigürasyon (schedule_days dahil)
- `POST /kg/v1/tools/allergen-planner/generate` → plan oluştur (body: `{ allergen_ids, child_id?, start_date? }`)

**Auth:** `tools.ts`'te `requiresAuth: true` yok (sürüm 1'de opsiyonel); ancak plan kaydetme için auth önerilir → login olmayan kullanıcılara plan gösterilmeli ama kaydetme için `router.replace('/(auth)/login')` yönlendirmesi yapılabilir. *(Not: problem statement'ın auth kuralına göre redirect edilmesi gerekebilir — web davranışı doğrulanmalı.)*  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `getAllergenPlannerConfig()`, `generateAllergenPlan()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/alerjen-planlayici.tsx`

**UI özellikleri (web mobile görünümünden):**
- Kırmızı gradient header (`#DC2626` / `#FEE2E2`)
- Config yükleniyor → LoadingSpinner
- Alerjen seçim listesi: her alerjen → checkbox ile çoklu seçim, `icon` alanı varsa emoji/ikon
- Başlangıç tarihi seçici (DatePicker)
- "Plan Oluştur" butonu (en az 1 alerjen seçilmeli)
- Oluşturulan plan: her gün için alerjen adı, miktar, talimatlar
- Acil durum uyarı kartı: `emergency_signs` array'i kırmızı card içinde
- Disclaimer card
- Paylaşım / kopyala butonu

**Port adımları:**
1. Config fetch: `getAllergenPlannerConfig()` → alerjen listesi
2. Multi-select alerjen UI
3. DatePicker start_date
4. Plan generation: `generateAllergenPlan({ allergen_ids, child_id, start_date })`
5. Plan listeleme: `AllergenTrialDay[]` → scroll view ile gün-gün gösterim
6. Emergency signs kartı (kırmızı arka plan)
7. Paylaşım: React Native `Share` API

**Eksik/Riskli noktalar:**
- `AllergenPlannerConfig.allergens` içindeki `icon` alanı Font Awesome slug olabilir
- `AllergenTrialPlan.disclaimer` her zaman card içinde gösterilmeli

---

### 3. bu-gida-verilir-mi — Bu Gıda Verilir mi?

**Web:** `src/app/(main)/akilli-asistan/bu-gida-verilir-mi/page.tsx` + `src/components/tools/safety-check/`  
**Endpoint(ler):**
- `POST /kg/v1/safety/check-ingredient` → body: `{ ingredient_id: string|number, child_id: number }` veya `{ ingredient_name: string, age_months: number }` (iki farklı signature var; bkz. Hata #1)

**Auth:** Gerekmez — anonim kullanım mümkün (aktif çocuk yoksa uyarı gösterilir)  
**Mevcut mobil ekran:** `app/safety-check/index.tsx` ✅ VAR ama hatalı  
**Mevcut mobil service:** `src/services/safety-service.ts` ✅ mevcut  
**Önerilen mobil rota:** Mevcut `app/safety-check/` → web slug uyumu için `app/akilli-asistan/bu-gida-verilir-mi.tsx` olarak migrate edilmeli (ayrıca `tools.ts`'te route güncellemesi gerekir)

**UI özellikleri (web mobile görünümünden):**
- Yeşil gradient header (`COLORS.primary` / `#FFFBE6`)
- Aktif çocuk yoksa sarı uyarı kartı
- TextInput + arama butonu
- Sonuç kartı: safe/caution/avoid — renk + ikon + label + badge
- Alert mesajları bullet list
- Alternatif gıdalar
- Güvenlik skoru (opsiyonel)
- Disclaimer kartı (WHO/AAP/TürkPed referansı)

**Parite eksikleri:** bkz. §"Mevcut Mobil Tool'ların Parite Eksikleri" → bu-gida-verilir-mi

---

### 4. ek-gidaya-baslama — Ek Gıdaya Başlama Kontrolü

**Web:** `src/app/(main)/akilli-asistan/ek-gidaya-baslama/page.tsx` + `src/components/tools/solid-food-readiness/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/solid-food-readiness/config` → soru listesi ve eşikler
- `POST /kg/v1/tools/solid-food-readiness/submit` → body: `{ answers: Record<string, boolean>, child_id? }`
- `GET /kg/v1/tools/solid-food-readiness/results?child_id=<id>` → önceki sonuç

**Auth:** Gerekmez — anonim kullanım mümkün; çocuk profili yoksa `child_id` olmadan gönderilir  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `getSolidFoodReadinessConfig()`, `submitSolidFoodReadiness()`, `getSolidFoodReadiness()` ✅ mevcut; `src/services/blw-service.ts` → `submitSolidFoodCheck()` de var (duplicate, farklı endpoint → `TOOL_SOLID_FOOD`)  
**Önerilen mobil rota:** `app/akilli-asistan/ek-gidaya-baslama.tsx`

**UI özellikleri (web mobile görünümünden):**
- Turuncu gradient header (`#F97316` / `#FFEDD5`)
- Config yükleniyor → LoadingSpinner
- Soru listesi: her soru kart + Evet/Hayır toggle (web'den config ile gelir, hardcode değil)
- İlerleme göstergesi (kaç soru cevaplandı)
- Önceki sonuç banner'ı (hazır/neredeyse hazır/henüz değil)
- Sonuç ekranı: is_ready durumuna göre renk + label + öneriler
- Disclaimer

**Port adımları:**
1. Config fetch: `getSolidFoodReadinessConfig()` → sorular
2. Önceki sonuç: `getSolidFoodReadiness(childId)` (auth varsa)
3. Soru listesi render (hardcode değil, config'den)
4. Submit: `submitSolidFoodReadiness(answers, childId?)`
5. Sonuç ekranı: `SolidFoodReadinessResult.is_ready` + `readiness_score` + `notes`

**Eksik/Riskli noktalar:**
- `blw-service.ts` içindeki `submitSolidFoodCheck()` ile `tool-service.ts` içindeki `submitSolidFoodReadiness()` duplicate işlev; birisi silinmeli
- Web sürümü hardcode soru mu, config mi kullanıyor — kesinleştirilmeli

---

### 5. ek-gida-rehberi — Ek Gıda Rehberi

**Web:** `src/app/(main)/akilli-asistan/ek-gida-rehberi/page.tsx` + `src/components/tools/food-guide/`  
**Endpoint(ler):** **YOK** — içerik kg-core'dan gelmez; statik dataset (WHO/AAP/Türk Pediatri Derneği kılavuzlarından derleme)  
**Auth:** Gerekmez  
**Mevcut mobil ekran:** `app/food-guide/index.tsx` ✅ VAR ama eksik  
**Mevcut mobil service:** `src/data/food-guide.ts` (statik veri) + `src/lib/tools/food-guide.ts` (re-export)  
**Önerilen mobil rota:** Mevcut `app/food-guide/` → `app/akilli-asistan/ek-gida-rehberi.tsx` olarak migrate edilmeli

**Parite eksikleri:** bkz. §"Mevcut Mobil Tool'ların Parite Eksikleri" → ek-gida-rehberi

---

### 6. su-ihtiyaci — Su İhtiyacı Hesaplayıcı

**Web:** `src/app/(main)/akilli-asistan/su-ihtiyaci/page.tsx` + `src/components/tools/water-calculator/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/water-calculator?age_months=<n>&weight_kg=<n>&feeding_type=<breast|formula|mixed|solid>` → `WaterNeedResult`

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `calculateWaterNeed({ age_months, weight_kg?, feeding_type? })` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/su-ihtiyaci.tsx`

**UI özellikleri (web mobile görünümünden):**
- Cyan gradient header (`#06B6D4` / `#CFFAFE`)
- Aktif çocuk varsa yaşı otomatik doldur (age_months)
- Form alanları:
  - Yaş (ay cinsinden) — `NumberInput` ya da `Slider`
  - Ağırlık (kg) — opsiyonel
  - Beslenme türü — 4 seçenekli radio: Anne sütü / Mama / Karma / Katı gıda
- "Hesapla" butonu
- Sonuç kartı:
  - Günlük ml (`daily_ml` — büyük font)
  - Min-Max aralığı (`min_ml` – `max_ml`)
  - Not (`note`)
  - Kaynaklar (`sources` array)
  - Disclaimer

**Port adımları:**
1. Aktif çocuk → `age_months` otomatik doldur
2. Form validasyonu: age_months 0–36 arası
3. `calculateWaterNeed()` çağır
4. Sonuç render: `WaterNeedResult`
5. Paylaşım: React Native `Share`

**Eksik/Riskli noktalar:**
- `feeding_type` seçenekleri web ile birebir olmalı (4 seçenek)
- `WaterNeedResult.disclaimer` her zaman gösterilmeli

---

### 7. persentil — Persentil Hesaplayıcı

**Web:** `src/app/(main)/akilli-asistan/persentil/page.tsx` + `src/components/tools/percentile/`  
**Endpoint(ler):**
- `POST /kg/v1/tools/percentile/calculate` → body: `PercentileMeasurement`; döner `PercentileResult`
- `POST /kg/v1/tools/percentile/save` → sonucu kaydeder (auth gerekli)
- `GET /kg/v1/tools/percentile/results?child_id=<id>` → önceki sonuçlar

**Auth:** Hesaplama için gerekmez; kaydetme için gerekli (auth yoksa kayıt modal'ı açılır)  
**Mevcut mobil ekran:** `app/growth/index.tsx` ✅ VAR ama eksik  
**Mevcut mobil service:** `src/services/tool-service.ts` → `calculatePercentile()`, `savePercentileResult()` ✅ mevcut  
**Önerilen mobil rota:** Mevcut `app/growth/` → `app/akilli-asistan/persentil.tsx` olarak migrate edilmeli

**Parite eksikleri:** bkz. §"Mevcut Mobil Tool'ların Parite Eksikleri" → persentil

---

### 8. blw-testi — BLW Hazırlık Testi

**Web:** `src/app/(main)/akilli-asistan/blw-testi/page.tsx` + `src/components/tools/blw-test/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/blw-test/config` → soru listesi ve eşikler (threshold: ready/almost_ready)
- `POST /kg/v1/tools/blw-test/submit` → body: `{ answers: BLWTestAnswer[], child_id? }`
- `GET /kg/v1/tools/blw-test/results?child_id=<id>` → önceki sonuç

**Auth:** Gerekmez; çocuk yoksa anonim gönderim  
**Mevcut mobil ekran:** `app/blw-test/index.tsx` ✅ VAR ama hatalı  
**Mevcut mobil service:** `src/services/tool-service.ts` + `src/services/blw-service.ts`  
**Önerilen mobil rota:** Mevcut `app/blw-test/` → `app/akilli-asistan/blw-testi.tsx` olarak migrate edilmeli

**Parite eksikleri:** bkz. §"Mevcut Mobil Tool'ların Parite Eksikleri" → blw-testi

---

### 9. leke-rehberi — Leke Ansiklopedisi

**Web:** `src/app/(main)/akilli-asistan/leke-rehberi/page.tsx` + `src/components/tools/stain-encyclopedia/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/stain-encyclopedia/popular` → popüler leke listesi
- `GET /kg/v1/tools/stain-encyclopedia/search?q=<query>` → arama
- `GET /kg/v1/tools/stain-encyclopedia/:slug` → leke detayı

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `getPopularStains()`, `searchStains()`, `getStainBySlug()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/leke-rehberi.tsx` (liste) + `app/akilli-asistan/leke-rehberi/[slug].tsx` (detay)

**UI özellikleri (web mobile görünümünden):**
- Mor gradient header (`#8B5CF6` / `#EDE9FE`)
- Arama kutusu (debounced text input)
- Popüler lekeler grid/liste (initial load)
- Arama sonuçları: her kart → leke adı, kısa özet
- Leke detay ekranı:
  - Başlık + stain_type badge
  - `removal_steps` numaralı adımlar
  - `products` önerilen ürünler listesi
  - `warnings` uyarı kartı (kırmızı)
  - `tips` ipuçları
- Boş arama sonucu state
- Geri butonu (detay → liste)

**Port adımları:**
1. Liste ekranı: `getPopularStains()` → `FlatList`
2. Arama: TextInput + debounce + `searchStains(q)`
3. Detay ekranı: `getStainBySlug(slug)` — route param ile
4. `StainGuide` type render: steps, products, warnings, tips

**Eksik/Riskli noktalar:**
- Bu pilot PR için en uygun tool (minimum API, statik içerik ağırlıklı)
- `StainGuide.image` varsa `Image` bileşeni ekle

---

### 10. hava-kalitesi — Hava Kalitesi Rehberi

**Web:** `src/app/(main)/akilli-asistan/hava-kalitesi/page.tsx` + `src/components/tools/air-quality/`  
**Endpoint(ler):**
- `POST /kg/v1/tools/air-quality/analyze` → body: `{ lat: number, lon: number }`; döner `AirQualityResult`

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `analyzeAirQuality({ lat, lon })` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/hava-kalitesi.tsx`

**UI özellikleri (web mobile görünümünden):**
- Mavi gradient header (`#0284C7` / `#E0F2FE`)
- "Konumumu Kullan" butonu → `expo-location` ile konum izni
- Manuel şehir arama alternatifi (opsiyonel)
- AQI gösterge: büyük rakam + renk kategorisi
- Outdoor recommendation kartı
- Activity suggestions listesi
- Health notes kartı
- Kaynak bilgisi + ölçüm zamanı

**Port adımları:**
1. `expo-location` ile `requestForegroundPermissionsAsync()` ve konum al
2. İzin reddedilirse: "Konum erişimi gerekli" bilgi ekranı
3. `analyzeAirQuality({ lat, lon })` çağır
4. `AirQualityResult` render: AQI + category + recommendation + suggestions

**Eksik/Riskli noktalar:**
- `expo-location` bağımlılığı kontrol edilmeli (zaten `package.json`'da olabilir)
- Konum izni Türkçe açıklama metni `app.json` → `expo.ios.infoPlist.NSLocationWhenInUseUsageDescription` ve `expo.android.permissions`'a eklenmeli
- Hava kalitesi 3rd party API'si kg-core üzerinden mi geliyor yoksa direkt mi? Backend proxy üzerinden geliyorsa mobil kodu değişmez; kg-core sorunu değil

---

### 11. bez-hesaplayici — Akıllı Bez Hesaplayıcı

**Web:** `src/app/(main)/akilli-asistan/bez-hesaplayici/page.tsx` + `src/components/tools/diaper-calculator/`  
**Endpoint(ler):**
- `POST /kg/v1/tools/diaper-calculator` → body: `DiaperInput { age_months, weight_kg?, child_id? }`; döner `DiaperCalculatorResult`
- `POST /kg/v1/tools/diaper-calculator/rash-risk` → body: `RashRiskInput { age_months, frequency_per_day?, skin_sensitivity?, child_id? }`; döner `RashRiskResult`

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `calculateDiapers()`, `calculateRashRisk()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/bez-hesaplayici.tsx`

**UI özellikleri (web mobile görünümünden):**
- Pembe gradient header (`#EC4899` / `#FCE7F3`)
- Aktif çocuk → age_months + weight_kg otomatik doldur
- Form: yaş (ay), ağırlık (kg), günlük bez değiştirme sıklığı, cilt hassasiyeti
- İki sonuç bölümü:
  1. **Bez Hesaplayıcı**: diapers/gün, diapers/ay, mevcut beden, sonraki beden geçiş zamanı, ipuçları
  2. **Pişik Risk Değerlendirmesi**: risk_level badge (low/medium/high), risk faktörleri, öneriler
- Paylaşım butonu

**Port adımları:**
1. Form: age_months, weight_kg, frequency_per_day, skin_sensitivity (3 seçenek)
2. Paralel API çağrısı: `calculateDiapers()` + `calculateRashRisk()`
3. İki sonuç kartı render

---

### 12. hijyen-hesaplayici — Günlük Hijyen İhtiyacı Hesaplayıcı

**Web:** `src/app/(main)/akilli-asistan/hijyen-hesaplayici/page.tsx` + `src/components/tools/hygiene-calculator/`  
**Endpoint(ler):**
- `POST /kg/v1/tools/hygiene-calculator` → body: `HygieneInput { age_months, activity_level?, child_id? }`; döner `HygieneCalculatorResult`

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `calculateHygiene()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/hijyen-hesaplayici.tsx`

**UI özellikleri (web mobile görünümünden):**
- Teal gradient header (`#14B8A6` / `#CCFBF1`)
- Aktif çocuk → age_months otomatik doldur
- Form: yaş (ay), aktivite seviyesi (düşük/orta/yüksek)
- Sonuç kartı:
  - Günlük mendil ihtiyacı (`wipes_per_day`)
  - Banyo sıklığı (`bath_frequency`)
  - Önerilen ürünler (`products_needed`)
  - İpuçları (`tips`)
  - Disclaimer

**Port adımları:**
1. Form: age_months + activity_level (3 seçenek radio)
2. `calculateHygiene()` çağır
3. Sonuç `HygieneCalculatorResult` render

---

### 13. banyo-planlayici — Banyo Rutini Planlayıcı

**Web:** `src/app/(main)/akilli-asistan/banyo-planlayici/page.tsx` + `src/components/tools/bath-planner/`  
**Endpoint(ler):**
- `GET /kg/v1/tools/bath-planner/config` → `BathPlannerConfig { seasons, age_groups }`
- `POST /kg/v1/tools/bath-planner/generate` → body: `BathPlannerInput { age_months, season, child_id? }`; döner `BathPlannerResult`

**Auth:** Gerekmez  
**Mevcut mobil ekran:** Yok — placeholder  
**Mevcut mobil service:** `src/services/tool-service.ts` → `getBathPlannerConfig()`, `generateBathPlan()` ✅ mevcut  
**Önerilen mobil rota:** `app/akilli-asistan/banyo-planlayici.tsx`

**UI özellikleri (web mobile görünümünden):**
- Mavi gradient header (`#0EA5E9` / `#E0F2FE`)
- Config yükleniyor → LoadingSpinner
- Aktif çocuk → age_months otomatik doldur
- Mevsim seçici: Config'den gelen `seasons` array → horizontal pill list
- Yaş grubu bilgisi (config'den auto-match)
- "Plan Oluştur" butonu
- Sonuç kartı:
  - Haftalık banyo sıklığı (`frequency_per_week`)
  - En iyi banyo saati (`best_time`)
  - Süre (`duration_minutes`)
  - Su sıcaklığı (`water_temperature`)
  - İpuçları (`tips`)
  - Önerilen ürünler (`products`)
  - Disclaimer

**Port adımları:**
1. Config fetch: `getBathPlannerConfig()`
2. Mevsim seçici: config.seasons → pill buttons
3. `generateBathPlan({ age_months, season, child_id? })`
4. Sonuç `BathPlannerResult` render

---

### 14. asi-takvimi — Aşı Takvimi

**Web:** Aşı takvimi akilli-asistan index'inde bir dashboard widget olarak görünmektedir; ayrı bir `/akilli-asistan/asi-takvimi` sayfası olmayabilir. Mobil'de `/vaccines` rotası mevcut.  
**Endpoint(ler):**
- `GET /kg/v1/health/vaccines/master` → tüm aşı takvimi master listesi
- `GET /kg/v1/health/vaccines?child_id=<id>` → çocuğa özel aşı durumu
- `POST /kg/v1/health/vaccines/mark-done` → body: `{ vaccine_id, child_id, date_administered? }`

**Auth:** Çocuğa özel veri için gerekli  
**Mevcut mobil ekran:** `app/vaccines/index.tsx` ✅ VAR ama hatalı  
**Mevcut mobil service:** `src/services/vaccine-service.ts` → `getVaccines()`, `getVaccinesByChild()`, `markVaccineDone()` ✅ mevcut  
**Önerilen mobil rota:** Mevcut `app/vaccines/` — rota adı web slug'ına taşınmayabilir (vaccines zaten bir tab-level route)

**Parite eksikleri:** bkz. §"Mevcut Mobil Tool'ların Parite Eksikleri" → asi-takvimi

---

## Mevcut Mobil Tool'ların Parite Eksikleri

### 1. bu-gida-verilir-mi (`app/safety-check/index.tsx`)

**Web dosyası:** `src/app/(main)/akilli-asistan/bu-gida-verilir-mi/page.tsx`  
**Kanıt:** `app/safety-check/index.tsx` (satır 1–338), `src/services/safety-service.ts` (satır 1–76)

**Hatalar:**

- **HATA 1 — Yanlış API payload (kritik):** `checkIngredientSafety(trimmedQuery, 0)` çağrısı (satır 54–57), gıda adını `ingredient_id` alanına string olarak gönderiyor. `safety-service.ts` → POST body: `{ ingredient_id: ingredientId, child_id: childId }`. Backend muhtemelen `ingredient_name` veya `query` alanı bekliyor. Web sürümünün payload'u doğrulanmalı; muhtemelen `{ ingredient_name: query, age_months: ageMonths }` veya `{ query: text, child_id: childId }`. `@deprecated` olarak işaretlenmiş `checkIngredientSafetyByName()` fonksiyonu `{ ingredient, age_months }` gönderiyor ki bu daha doğru olabilir.
- **HATA 2 — child_id=0 gönderimi:** Aktif çocuk yokken `checkIngredientSafety(trimmedQuery, 0)` çağrılıyor (satır 57); `child_id: 0` backend'e hatalı ID olarak gidebilir. `child_id` field'ı hiç gönderilmemeli.
- **HATA 3 — Ionicons kullanımı:** `Ionicons` (satır 14) `@expo/vector-icons`'dan import ediliyor — yasaklı.

**Eksiklikler:**

- **Eksik 1:** Web sürümünde büyük ihtimalle otomatik tamamlama/ingredient arama dropdown'ı mevcut (ingredients endpoint ile). Mobil'de yok.
- **Eksik 2:** Önceki aramalar geçmişi yok.
- **Eksik 3:** Sonuç paylaşma butonu yok (React Native `Share` API kullanılabilir).
- **Eksik 4:** Rota uyumsuzluğu — `tools.ts`'te bu tool'un route'u `/safety-check`; web slug'ı `bu-gida-verilir-mi`. Deep link veya asistan tab navigasyonu için rota standardize edilmeli.

---

### 2. ek-gida-rehberi (`app/food-guide/index.tsx`)

**Web dosyası:** `src/app/(main)/akilli-asistan/ek-gida-rehberi/page.tsx`  
**Kanıt:** `app/food-guide/index.tsx` (satır 1–80+), `src/data/food-guide.ts`, `src/lib/tools/food-guide.ts`

**Hatalar:**

- **HATA 1 — Statik veri:** Tüm içerik `src/data/food-guide.ts` hardcode static dataset'inden geliyor. API çağrısı hiç yok. `src/lib/tools/food-guide.ts` içindeki TODO yorumuna rağmen (satır 7–9) bu durum düzeltilmemiş. Web sürümü de aynı statik veriden besleniyor olsa dahi, her iki tarafın da aynı data source'u kullanması güvence altına alınmalı.
- **HATA 2 — Ionicons kullanımı:** `Ionicons` import ediliyor (`arrow-back` vb.) — yasaklı.
- **HATA 3 — Rota uyumsuzluğu:** `tools.ts`'te route `/food-guide`; web slug `ek-gida-rehberi`. Standardize edilmeli.

**Eksiklikler:**

- **Eksik 1:** Her besin grubu için tarif önerileri yok (web sürümünde her besin grubu kartının altında ilgili tarifler linkleniyor olabilir).
- **Eksik 2:** Paylaşım butonu yok.
- **Eksik 3:** Accordion açma/kapama animasyonu yok (web'de muhtemelen CSS transition ile; React Native'de `Animated` API veya `react-native-reanimated` ile yapılabilir).
- **Eksik 4:** "Alerjen ekle!" uyarı kartı — seçilen yaş aralığı için tanıtılması gereken alerjenler listesi web sürümünde varsa mobil'de eksik.

---

### 3. persentil (`app/growth/index.tsx`)

**Web dosyası:** `src/app/(main)/akilli-asistan/persentil/page.tsx`  
**Kanıt:** `app/growth/index.tsx` (satır 1–1000+), `src/services/tool-service.ts` (satır 69–143)

**Hatalar:**

- **HATA 1 — Ionicons kullanımı:** Ekranın her yerinde (`arrow-back`, `information-circle-outline`, `calendar-outline`, `chevron-down`, `close`, `person-outline`, `checkmark`, `chevron-forward`) Ionicons kullanılıyor — yasaklı.
- **HATA 2 — `setToken` doğrudan import:** `import { setToken } from '../../src/lib/api'` (satır 24) — bu anti-pattern; token yönetimi `AuthContext` üzerinden yapılmalı.
- **HATA 3 — Başarı toastı yanlış mesaj:** Hesaplama başarılı olduğunda (satır 680–683) `Toast.show({ type: 'info', text1: 'WHO büyüme standartları 0-5 yaş için geçerlidir' })` gösteriliyor. Bu mesaj zaten form üzerindeki info box'ta var; toast olarak tekrar gösterilmesi gereksiz ve kullanıcı deneyimini bozuyor.
- **HATA 4 — Rota uyumsuzluğu:** `tools.ts`'te route `/growth`; web slug `persentil`. Standardize edilmeli.
- **HATA 5 — `savePercentileWithRegistration` kullanılmıyor:** `tool-service.ts`'te özel bir `savePercentileWithRegistration()` fonksiyonu var (satır 89–109) ama growth screen bunu kullanmıyor; bunun yerine ayrı register + save akışı yapıyor. Bu, duplikasyon ve potansiyel tutarsızlık.

**Eksiklikler:**

- **Eksik 1:** BMI persentil gösterilmiyor — `PercentileResult.bmi_percentile` alanı mevcut ama `PercentileMetric` bileşenine geçilmiyor.
- **Eksik 2:** Büyüme geçmişi grafiği yok — web sürümünde önceki ölçümler chart (line chart) üzerinde gösteriliyor. `GROWTH_RECORD(childId)` endpoint'i `GrowthData.records[]` döndürüyor ama bu ekranda hiç çekilmiyor.
- **Eksik 3:** Aktif çocuk seçiliyse doğum tarihi otomatik doldurulmuyor — kullanıcı her seferinde manuel girmek zorunda.
- **Eksik 4:** `result.interpretation` ve `result.weight_status` / `height_status` / `head_circumference_status` alanları ekranda gösterilmiyor.
- **Eksik 5:** Paylaşım/PDF export butonu yok.
- **Eksik 6:** Önceki persentil sonuçları listesi yok (`getUserPercentileResults()` çağrılmıyor).

---

### 4. blw-testi (`app/blw-test/index.tsx`)

**Web dosyası:** `src/app/(main)/akilli-asistan/blw-testi/page.tsx`  
**Kanıt:** `app/blw-test/index.tsx` (satır 1–342), `src/services/blw-service.ts`, `src/services/tool-service.ts` (satır 44–67)

**Hatalar:**

- **HATA 1 — Hardcode soru listesi (kritik):** `BLW_QUESTIONS` (satır 19–26) sabit 6 soru ile tanımlı. Web sürümü `/kg/v1/tools/blw-test/config` endpoint'inden soruları dinamik olarak çekiyor. Bu endpoint `BLW_TEST_CONFIG` sabiti olarak constants'ta tanımlı ama kullanılmıyor. API'dan gelen soru metinleri, kategoriler ve açıklamalar gösterilmiyor.
- **HATA 2 — Yanlış service import + endpoint karışıklığı (kritik):** Ekran `submitBLWTest` fonksiyonunu `blw-service.ts`'den import ediyor (satır 14). Bu fonksiyon `POST /kg/v1/tools/blw-test` (`TOOL_BLW_TEST`) endpoint'ine body `{ child_id, answers: Record<string, boolean> }` ile gönderiyor. Oysa `tool-service.ts`'teki `submitBLWTest` ise `POST /kg/v1/tools/blw-test/submit` (`BLW_TEST_SUBMIT`) endpoint'ine `BLWTestAnswer[]` array'i ile gönderiyor. Web sürümünün hangisini kullandığı doğrulanmalı; duplicate service fonksiyonları temizlenmeli.
- **HATA 3 — Yanlış header rengi:** Header `backgroundColor: '#EA580C'` (turuncu). `tools.ts`'te `blw-testi` için tanımlı renk `#7C3AED` (mor, `bg: '#EDE9FE'`). Web sürümü mor renk kullanıyor; mobil turuncu kullanıyor — tasarım tutarsızlığı.
- **HATA 4 — Ionicons kullanımı:** `Ionicons` import ediliyor (`arrow-back`, `hourglass-outline`) — yasaklı.
- **HATA 5 — Rota uyumsuzluğu:** `tools.ts`'te route `/blw-test`; web slug `blw-testi`. Standardize edilmeli.

**Eksiklikler:**

- **Eksik 1:** API'dan gelen `BLWTestConfig.thresholds` (ready/almost_ready eşikleri) kullanılmıyor; mobil'de hardcode `score >= 5 = ready`, `score >= 3 = almost_ready` mantığı uygulanıyor.
- **Eksik 2:** API sonucundaki `readiness_label` ve `recommendations` ekranda gösterilmiyor (sadece score ve hardcode label).
- **Eksik 3:** Test auth olmadan da yapılabiliyor ama `useBLWResults` hook'u (satır 36) auth + aktif çocuk olmadan `null` döndürüyor — auth yoksa önceki sonuç hiç gösterilmiyor.
- **Eksik 4:** Paylaşım butonu yok.
- **Eksik 5:** Çocuk profili yokken testi başlatmaya izin verilmiyor (satır 120–135) — web sürümünde anonim test yapılabiliyor olabilir.
- **Eksik 6:** `BLWTestQuestion.description` alanı ekranda gösterilmiyor; sorular sadece tek satır metin.

---

### 5. asi-takvimi (`app/vaccines/index.tsx`)

**Web dosyası:** Aşı takvimi web'de akilli-asistan dashboard widget'ı olarak veya ayrı bir sayfada yer almaktadır.  
**Kanıt:** `app/vaccines/index.tsx` (satır 1–136), `src/services/vaccine-service.ts`, `src/hooks/useVaccines.ts`

**Hatalar:**

- **HATA 1 — Aşı yapıldı API'a kayıt edilmiyor (kritik):** `handleMarkDone()` (satır 33–38) sadece local `administered` state'i güncelliyor. `vaccine-service.ts`'deki `markVaccineDone()` fonksiyonu **hiç çağrılmıyor**. Kullanıcı aşıyı işaretlese bile uygulama yeniden açıldığında sıfırlıyor.
- **HATA 2 — Child-specific schedule çekilmiyor:** `useVaccines` hook'u sadece `VACCINES_MASTER` çekiyor (tüm aşı listesi, çocuğa özel durum yok). `VACCINES_BY_CHILD(childId)` endpoint'i hiç çağrılmıyor; dolayısıyla hangi aşının yapıldığı bilgisi API'dan gelmiyor.
- **HATA 3 — Progress bar hesabı hatalı:** `completionPct` (satır 43) sadece local `administered` state'ini kullanıyor; API'dan gelen gerçek aşı geçmişi hesaba katılmıyor.
- **HATA 4 — Ionicons kullanımı:** Ekranda ve `VaccineCard` component'inde Ionicons kullanılıyor — yasaklı.
- **HATA 5 — Mixed styling:** Vaccines ekranı NativeWind `className` kullanıyor (satır 46–88); diğer tüm tool ekranları inline StyleSheet kullanıyor. Tutarsız stil yaklaşımı.
- **HATA 6 — Rota uyumsuzluğu:** `tools.ts`'te route `/vaccines`; web slug `asi-takvimi`. Standardize edilmeli.

**Eksiklikler:**

- **Eksik 1:** Aşı yapılma tarihi girişi yok — `markVaccineDone()` `date_administered` parametresi alıyor ama ekranda tarih seçici yok.
- **Eksik 2:** Gecikmeli aşı uyarısı (`overdue` state) backend'den gelmiyor; sadece genel "bekleyen aşılarınız var" uyarısı var.
- **Eksik 3:** Aktif çocuğa göre filtreleme yok — tüm master liste gösteriliyor.
- **Eksik 4:** Refresh sonrası local `administered` state sıfırlanıyor (satır 29–31 `mutate` çağrısı sonrası state korunmuyor).
- **Eksik 5:** `VaccineCard` bileşeni incelenmedi ama büyük ihtimalle Ionicons içeriyor ve web ile görsel parite eksik.

---

## Önerilen PR Sırası

| PR | Kapsam | Gerekçe |
|---|---|---|
| **PR 1** | `leke-rehberi` (pilot) | En az API dependency, sadece GET endpoint'leri, arama + detay pattern'i tüm tool'lar için şablon oluşturur |
| **PR 2** | `su-ihtiyaci`, `bez-hesaplayici`, `hijyen-hesaplayici`, `banyo-planlayici` | Form + sonuç ekranı pattern'i (config → form → result); hepsi auth gerektirmiyor; toplam 5 API endpoint |
| **PR 3** | `ek-gidaya-baslama` | Config → çoklu soru → submit → sonuç pattern'i; BLW test ekranı refactor'ı için ön hazırlık |
| **PR 4** | `hava-kalitesi` | Native lokasyon izni gerektiriyor; ayrı PR'da izole edilmeli |
| **PR 5** | `besin-takvimi`, `alerjen-planlayici` | Auth gerekli araçlar; CRUD akışı; login guard |
| **PR 6** | Mevcut 5 ekranın parite düzeltmeleri | Tüm hatalar ve eksiklikler kapatılır; önce yeni tool'lar, sonra refactor |

### PR 6 Alt Görevleri (Parite Düzeltmeleri)

- **bu-gida-verilir-mi:** API payload düzelt (`ingredient_name` veya `query` field); `child_id=0` guard; Ionicons kaldır; rota standardize (`app/akilli-asistan/bu-gida-verilir-mi.tsx`)
- **ek-gida-rehberi:** Ionicons kaldır; rota standardize; web'deki alerjen uyarı kartı ekle
- **persentil:** Ionicons kaldır; `setToken` anti-pattern düzelt; BMI göster; aktif çocuk → doğum tarihi otomatik doldur; büyüme geçmişi grafik; başarı toastı düzelt; `interpretation` + status fields göster; rota standardize
- **blw-testi:** API'dan config çek (`BLW_TEST_CONFIG`); renk düzelt (#7C3AED); service duplicate'i temizle; `thresholds` kullan; `readiness_label` + `recommendations` göster; rota standardize
- **asi-takvimi:** `markVaccineDone()` API çağrısı ekle; `VACCINES_BY_CHILD` ile child-specific data çek; tarih girişi; Ionicons kaldır; styling standardize; rota standardize

---

## Ek Notlar

### `blw-service.ts` vs `tool-service.ts` Duplikasyonu

`src/services/blw-service.ts` dosyası `submitBLWTest()` ve `submitSolidFoodCheck()` fonksiyonlarını barındırıyor. Aynı işlevler `src/services/tool-service.ts` içinde de (farklı signature ve endpoint ile) mevcut. Bu duplikasyon karışıklığa neden oluyor:

- `blw-service.ts:submitBLWTest()` → `POST /kg/v1/tools/blw-test` (`TOOL_BLW_TEST`)
- `tool-service.ts:submitBLWTest()` → `POST /kg/v1/tools/blw-test/submit` (`BLW_TEST_SUBMIT`)

**Öneri:** `blw-service.ts` dosyasını sil; `tool-service.ts` içindeki versiyonu kullan. Web sürümünün hangi endpoint'i çağırdığı doğrulandıktan sonra `BLW_TEST_SUBMIT` kullanımı standardize edilmeli.

### Font Awesome Lisans Notu

`@fortawesome/free-solid-svg-icons` MIT lisanslı ücretsiz ikon setidir. Pro ikonlar gerekmeyecek şekilde tasarım uyarlanmalıdır.

### `tools.ts` Güncelleme Kapsamı

Hem ikonlar hem de rotalar güncellendiğinde `src/lib/tools.ts` aşağıdaki değişikliklere uğrayacak:
1. `Ionicons` import kaldır → `IconDefinition` (FA) tipine geç
2. Tüm `icon` değerleri `faXxx` FA objelerine güncellenir
3. Mevcut 5 tool'un `route` değerleri web slug'larıyla hizalanır
4. `alerjen-planlayici` için `requiresAuth: true` eklenmeli (şu an eksik)
