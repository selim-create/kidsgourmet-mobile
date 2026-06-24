# Backend API Map

> Source of truth for mobile ↔ backend API contract.
> Derived from `src/lib/constants.ts` and `src/services/*` code audit, cross-referenced with `TOOLS_PORT_AUDIT.md`.
> Note: `kg-core` and `kidsgourmet-web` repos are private; backend paths are confirmed via prior PR fixes and user-verified flows.
> Last updated: 2026-06-24 (PR #86 — systematic API audit)

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Mobile uses correctly — confirmed working (user-tested or code-verified) |
| ❌ | Mobile uses with wrong path/payload — **fixed in this PR** |
| 🆕 | Backend likely has it; mobile doesn't actively call it yet |
| ⚠️ | Verification needed — path unconfirmed against backend source |
| 🗑️ | Mobile constant exists but endpoint is deprecated/dead |

---

## 1. User & Profile

### `GET /kg/v1/user/me`
- **Status:** ✅ Confirmed working (user-tested)
- **Mobile constant:** `USER_ME` (`src/lib/constants.ts:17`)
- **Auth:** Required
- **Response:** `{ id, email, name, display_name?, username?, avatar_url?, role?, parent_role?, gender?, birth_date?, children?, ... }`
- **Mobile usage:** `user-service.ts:getUserProfile()`, `auth-service.ts:getProfile()`
- **Notes:** GET only — this route does NOT accept PUT (see profile update below)

### `GET /kg/v1/user/profile`
- **Status:** ✅ Confirmed working
- **Mobile constant:** `USER_PROFILE` (`src/lib/constants.ts:18`)
- **Auth:** Required
- **Response:** Extended user profile including avatar and children
- **Mobile usage:** `user-service.ts:getUserProfile()` (fallback for avatar when `/user/me` lacks it)

### `PUT /kg/v1/user/profile`
- **Status:** ✅ Confirmed working (user-tested)
- **Mobile constant:** `USER_PROFILE` (`src/lib/constants.ts:18`)
- **Auth:** Required
- **Body:** `{ name?, parent_role?, gender?, birth_date?, ... }`
- **Response:** Updated user object (wrapped or raw)
- **Mobile usage:** `user-service.ts:updateUserProfile()`, `auth-service.ts:updateProfile()`
- **Notes:** Previous PRs fixed this — was incorrectly calling `PUT /user/me` (not a valid route)

### `POST /kg/v1/user/avatar`
- **Status:** ✅ Confirmed working (header avatar shows correctly after upload)
- **Mobile constant:** `USER_AVATAR` (`src/lib/constants.ts:19`)
- **Auth:** Required (****** in header, NOT in JSON body)
- **Body:** FormData — `file` field with image
- **Response:** `{ id: number, source_url?: string, url?: string }`
- **Mobile usage:** `user-service.ts:uploadUserAvatar()`

### `GET /kg/v1/auth/me`
- **Status:** ⚠️ Verification needed — constant exists (`AUTH_ME`) but no service uses it
- **Mobile constant:** `AUTH_ME` (`src/lib/constants.ts:11`)
- **Auth:** Required
- **Mobile usage:** None
- **Notes:** Possibly a login-validation endpoint; `USER_ME` is used instead

### `POST /kg/v1/auth/login`
- **Status:** ✅
- **Mobile constants:** `LOGIN`, `AUTH_LOGIN` (identical, `src/lib/constants.ts:5,9`)
- **Auth:** Not required
- **Body:** `{ email, password }`
- **Response:** `{ token, ... }`
- **Mobile usage:** `auth-service.ts:login()`

### `POST /kg/v1/auth/register`
- **Status:** ✅
- **Mobile constants:** `REGISTER`, `AUTH_REGISTER` (identical, `src/lib/constants.ts:6,10`)
- **Auth:** Not required
- **Body:** RegisterData (email, password, name, etc.)
- **Response:** `{ token, ... }`
- **Mobile usage:** `auth-service.ts:register()`

### `POST /kg/v1/auth/logout`
- **Status:** ✅
- **Mobile constant:** `LOGOUT` (`src/lib/constants.ts:7`)
- **Auth:** Required
- **Mobile usage:** `auth-service.ts:logout()`

### `POST /kg/v1/auth/forgot-password`
- **Status:** 🆕 — constant defined, no service function calls it
- **Mobile constant:** `AUTH_FORGOT_PASSWORD` (`src/lib/constants.ts:13`)

### `POST /kg/v1/auth/reset-password`
- **Status:** 🆕 — constant defined, no service function calls it
- **Mobile constant:** `AUTH_RESET_PASSWORD` (`src/lib/constants.ts:14`)

### `GET /kg/v1/auth/google`
- **Status:** 🆕 — constant defined, no service function calls it
- **Mobile constant:** `AUTH_GOOGLE` (`src/lib/constants.ts:12`)

---

## 2. Children

### `GET /kg/v1/user/children`
- **Status:** ✅ Confirmed working (user-tested)
- **Mobile constants:** `CHILDREN`, `CHILD_PROFILES` (identical, `src/lib/constants.ts:20,26`)
- **Auth:** Required
- **Response:** `Child[]`
- **Mobile usage:** `user-service.ts:getChildren()`

### `POST /kg/v1/user/children`
- **Status:** ✅ Confirmed working (user-tested — child add)
- **Mobile constant:** `CHILDREN` / `CHILD_PROFILES` (`src/lib/constants.ts:20,26`)
- **Auth:** Required
- **Body:** `{ name, birth_date, gender?, allergies?, diet_types?, notes?, kvkk_consent?, guardian_declaration?, sensitive_data_consent?, terms_accepted? }`
- **Response:** Created `Child` object
- **Mobile usage:** `user-service.ts:createChild()`

### `GET /kg/v1/user/children/{uuid}` _(does NOT exist on backend)_
- **Status:** 🗑️ Backend does NOT register a GET route for a single child
- **Mobile constant:** `CHILD_PROFILE(uuid)` (`src/lib/constants.ts:27`)
- **Notes:** Fixed in prior PR — mobile now calls `getChildren()` and filters client-side via `getChild(uuid)`

### `PUT /kg/v1/user/children/{uuid}`
- **Status:** ✅ Confirmed working (user-tested — child edit)
- **Mobile constant:** `CHILD_PROFILE(uuid)` (`src/lib/constants.ts:27`)
- **Auth:** Required
- **Body:** Partial `ChildUpsertPayload`
- **Response:** Updated `Child` object
- **Mobile usage:** `user-service.ts:updateChild()`

### `DELETE /kg/v1/user/children/{uuid}`
- **Status:** ✅
- **Mobile constant:** `CHILD_PROFILE(uuid)` (`src/lib/constants.ts:27`)
- **Auth:** Required
- **Mobile usage:** `user-service.ts:deleteChild()`

### `POST /kg/v1/user/children/{uuid}/avatar`
- **Status:** ✅
- **Mobile constant:** `CHILD_PROFILE_AVATAR(uuid)` (`src/lib/constants.ts:28`)
- **Auth:** Required (****** FormData body — `avatar` field)
- **Mobile usage:** `user-service.ts:uploadChildAvatar()`

### `GET /kg/v1/user/children/{uuid}/avatar`
- **Status:** ⚠️ Verification needed — likely returns signed URL
- **Mobile constant:** `CHILD_PROFILE_AVATAR(uuid)` (`src/lib/constants.ts:28`)
- **Auth:** Required
- **Mobile usage:** `user-service.ts:getChildAvatarUrl()`

### `DELETE /kg/v1/user/children/{uuid}/avatar`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CHILD_PROFILE_AVATAR(uuid)` (`src/lib/constants.ts:28`)
- **Mobile usage:** `user-service.ts:deleteChildAvatar()`

---

## 3. Consents

### `GET /kg/v1/user/consents`
- **Status:** ✅ Confirmed working (user-tested)
- **Mobile constant:** `USER_CONSENTS` (`src/lib/constants.ts:224`)
- **Auth:** Required
- **Response:** `UserConsent[]` or `{ data: [], consents: [] }` (both handled defensively)
- **Mobile usage:** `consent-service.ts:getConsents()`
- **Notes:** Normalizes `consent_type` field — maps `terms_accepted` → `terms`, `marketing_consent` → `marketing`

### `PUT /kg/v1/user/consents/{type}`
- **Status:** ✅ Confirmed working (user-tested)
- **Mobile constant:** `USER_CONSENT_UPDATE(type)` (`src/lib/constants.ts:226`)
- **Auth:** Required
- **Body:** `{ consented: boolean }`
- **Response:** `{ success: boolean }`
- **Valid types:** `terms`, `marketing`, `sensitive_data`, `guardian_declaration`
- **Mobile usage:** `consent-service.ts:updateConsent()`

### `GET /kg/v1/user/consents/history`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_CONSENT_HISTORY` (`src/lib/constants.ts:225`)
- **Auth:** Required
- **Query params:** `?type={consentType}` (optional)
- **Mobile usage:** `consent-service.ts:getConsentHistory()`

---

## 4. Recipes

### `GET /kg/v1/recipes`
- **Status:** ✅
- **Mobile constants:** `RECIPES` (`src/lib/constants.ts:31`)
- **Auth:** Not required
- **Query params:** `search`, `age-group`, `meal-type`, `diet-type`, `special-condition`, `ingredient`, `expert_approved`, `difficulty`, `max_time`, `orderby`, `order`, `page`, `per_page`
- **Response:** `{ recipes: [], total, page, per_page, total_pages }` or `{ items: [], ... }`
- **Mobile usage:** `recipe-service.ts:getRecipes()`

### `GET /kg/v1/recipes/{slug}`
- **Status:** ✅
- **Mobile constants:** `RECIPE(slug)`, `RECIPE_BY_SLUG(slug)` (identical, `src/lib/constants.ts:32,33`)
- **Auth:** Not required
- **Response:** `Recipe` or `{ recipe: Recipe }` or `{ data: Recipe }` (all handled)
- **Mobile usage:** `recipe-service.ts:getRecipe()`

### `GET /kg/v1/recipes/{id}/related`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `RECIPE_RELATED(recipeId)` (`src/lib/constants.ts:35`)
- **Auth:** Not required
- **Query params:** `limit`
- **Mobile usage:** `recipe-service.ts:getRelatedRecipes()`

### `POST /kg/v1/recipes/{id}/rate`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `RECIPE_RATING(recipeId)` (`src/lib/constants.ts:75`)
- **Auth:** Required
- **Body:** `{ rating: number }`
- **Response:** `{ rating: number, rating_count: number }`
- **Mobile usage:** `recipe-service.ts:rateRecipe()`

### `GET /kg/v1/recipes/{id}/comments`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `RECIPE_COMMENTS(recipeId)` (`src/lib/constants.ts:117`)
- **Auth:** Not required (GET)
- **Mobile usage:** `comment-service.ts:getRecipeComments()`

### `POST /kg/v1/recipes/{id}/comments`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `RECIPE_COMMENTS(recipeId)` (`src/lib/constants.ts:117`)
- **Auth:** Required
- **Body:** `{ content: string }`
- **Mobile usage:** `comment-service.ts:addComment()`

### `GET /kg/v1/featured/recipes`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FEATURED_RECIPES` (`src/lib/constants.ts:140`)
- **Auth:** Not required
- **Mobile usage:** `recipe-service.ts:getFeaturedRecipes()`

---

## 5. Favorites & Collections

### `GET /kg/v1/user/favorites`
- **Status:** ✅
- **Mobile constants:** `FAVORITES`, `USER_FAVORITES` (identical, `src/lib/constants.ts:39,40`)
- **Auth:** Required
- **Response:** `Recipe[]` or `{ items?: [], recipes?: [], data?: [] }` (handled defensively)
- **Mobile usage:** `favorites-service.ts:getFavorites()`

### `POST /kg/v1/user/favorites`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_FAVORITES` (`src/lib/constants.ts:40`)
- **Auth:** Required
- **Body:** `{ item_id: number, item_type: 'recipe' | 'post' | 'ingredient' }`
- **Mobile usage:** `favorites-service.ts:addFavorite()`, `addFavoriteItem()`

### `DELETE /kg/v1/user/favorites/{id}`
- **Status:** ⚠️ Verification needed
- **Mobile usage:** `favorites-service.ts:removeFavoriteItem()` — appends `?type={itemType}` to path
- **Query params:** `type` (item type)

### `POST /kg/v1/user/favorites/toggle`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_FAVORITES_TOGGLE` (`src/lib/constants.ts:41`)
- **Auth:** Required
- **Body:** `{ item_id: number, item_type: 'ingredient' }`
- **Mobile usage:** `favorites-service.ts:toggleIngredientFavorite()`

### `GET /kg/v1/user/favorites/collections`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_FAVORITES_COLLECTIONS` (`src/lib/constants.ts:42`)
- **Auth:** Required
- **Mobile usage:** `favorites-service.ts:getFavoriteCollections()`

### `GET /kg/v1/user/collections`
- **Status:** 🆕 Constant defined, no active service uses it
- **Mobile constants:** `USER_COLLECTIONS`, `USER_COLLECTION_BY_ID`, `USER_COLLECTION_ITEMS` (`src/lib/constants.ts:229-231`)

---

## 6. Meal Plans

### `GET /kg/v1/meal-plan/current`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `MEAL_PLAN_CURRENT` (`src/lib/constants.ts:46`)
- **Auth:** Required
- **Mobile usage:** `meal-plan-service.ts:getCurrentMealPlan()`

### `POST /kg/v1/meal-plan/generate`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `MEAL_PLAN_GENERATE` (`src/lib/constants.ts:47`)
- **Auth:** Required
- **Body:** `{ child_id?, week?, year? }`
- **Mobile usage:** `meal-plan-service.ts:generateMealPlan()`

### `GET /kg/v1/meal-plan/{year}/{week}`
- **Status:** ⚠️ Verification needed — unusual URL pattern (year/week in path)
- **Mobile constant:** `MEAL_PLAN_WEEK(year, week)` (`src/lib/constants.ts:48`)
- **Auth:** Required
- **Mobile usage:** `meal-plan-service.ts:getMealPlan()`

### `POST /kg/v1/meal-plan`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `MEAL_PLAN` (`src/lib/constants.ts:45`)
- **Auth:** Required
- **Body:** `{ recipe_id: number, meal_type_id: number, date: string }`
- **Mobile usage:** `meal-plan-service.ts:addRecipeToMealPlan()`

### `DELETE /kg/v1/meal-plan/{id}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** inline `${MEAL_PLAN}/${entryId}`
- **Mobile usage:** `meal-plan-service.ts:removeFromMealPlan()`

### `PATCH /kg/v1/meal-plan/{id}/complete`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** inline `${MEAL_PLAN}/${entryId}/complete`
- **Mobile usage:** `meal-plan-service.ts:markMealComplete()`

### Plural-path alternatives (⚠️ possible inconsistency)
The following constants use `/meal-plans/` (plural) vs the service which uses `/meal-plan/` (singular). Only the plural variants appear in constants but are NOT used by the current `meal-plan-service.ts`:

| Constant | Path | Status |
|---|---|---|
| `MEAL_PLANS_GENERATE` | `/kg/v1/meal-plans/generate` | 🗑️ Unused — service uses `MEAL_PLAN_GENERATE` |
| `MEAL_PLANS_ACTIVE(childId)` | `/kg/v1/meal-plans/active?child_id=...` | 🆕 Unused |
| `MEAL_PLAN_BY_ID(id)` | `/kg/v1/meal-plans/{id}` | 🆕 Unused |
| `MEAL_PLAN_REFRESH_SLOT` | `/kg/v1/meal-plans/{plan}/slots/{slot}/refresh` | 🆕 Unused |
| `MEAL_PLAN_SKIP_SLOT` | `/kg/v1/meal-plans/{plan}/slots/{slot}/skip` | 🆕 Unused |
| `MEAL_PLAN_ASSIGN_SLOT` | `/kg/v1/meal-plans/{plan}/slots/{slot}/assign` | 🆕 Unused |
| `MEAL_PLAN_SHOPPING_LIST(planId)` | `/kg/v1/meal-plans/{plan}/shopping-list` | 🆕 Unused |

---

## 7. Shopping List

### `GET /kg/v1/shopping-list`
- **Status:** ✅
- **Mobile constant:** `SHOPPING_LIST` (`src/lib/constants.ts:58`)
- **Auth:** Required
- **Response:** `BackendShoppingListItem[]` or `{ items: [] }` (both handled)
- **Mobile usage:** `shopping-list-service.ts:getShoppingList()`
- **Notes:** Backend field names: `item` (not `ingredient`), `quantity` (not `amount`); service maps these

### `POST /kg/v1/shopping-list`
- **Status:** ✅
- **Mobile constant:** `SHOPPING_LIST` (`src/lib/constants.ts:58`)
- **Auth:** Required
- **Body:** `{ item: string, quantity: string, category?, recipe_id?, recipe_title? }` ← note `item` and `quantity` (backend names)
- **Response:** Created `BackendShoppingListItem`
- **Mobile usage:** `shopping-list-service.ts:addShoppingListItem()`
- **Notes:** Service translates `ingredient`→`item`, `amount`→`quantity` before sending

### `DELETE /kg/v1/shopping-list/{id}`
- **Status:** ✅
- **Mobile constant:** `SHOPPING_LIST_ITEM(id)` (`src/lib/constants.ts:59`)
- **Auth:** Required
- **Mobile usage:** `shopping-list-service.ts:removeShoppingListItem()`

### `PATCH /kg/v1/shopping-list/{id}/toggle`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SHOPPING_LIST_ITEM_TOGGLE(id)` (`src/lib/constants.ts:60`)
- **Auth:** Required
- **Body:** `{ checked: boolean }`
- **Mobile usage:** `shopping-list-service.ts:toggleShoppingListItem()`

### `PATCH /kg/v1/shopping-list/{id}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SHOPPING_LIST_ITEM(id)` (`src/lib/constants.ts:59`)
- **Auth:** Required
- **Body:** `{ item?, quantity?, category? }`
- **Mobile usage:** `shopping-list-service.ts:updateShoppingListItem()`

### `POST /kg/v1/shopping-list/generate`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SHOPPING_LIST_GENERATE` (`src/lib/constants.ts:61`)
- **Auth:** Required
- **Body:** `{ meal_plan_id?, week?, child_id? }`
- **Mobile usage:** `shopping-list-service.ts:generateShoppingList()`

### `GET /kg/v1/user/shopping-list`
- **Status:** 🗑️ Constant defined but unused by any service
- **Mobile constant:** `USER_SHOPPING_LIST` (`src/lib/constants.ts:232`)
- **Notes:** Duplicate of `SHOPPING_LIST`? Different path.

---

## 8. Tools (Akıllı Asistan)

> Source: `TOOLS_PORT_AUDIT.md` + `src/services/tool-service.ts` + `src/lib/constants.ts`

### `GET /kg/v1/tools`
- **Status:** ✅
- **Mobile constant:** `TOOLS` (`src/lib/constants.ts:143`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getTools()`

### `GET /kg/v1/tools/{slug}`
- **Status:** ✅
- **Mobile constant:** `TOOL_BY_SLUG(slug)` (`src/lib/constants.ts:144`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getToolBySlug()`

### `GET /kg/v1/tools/blw-test/config`
- **Status:** ✅
- **Mobile constant:** `BLW_TEST_CONFIG` (`src/lib/constants.ts:149`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getBLWTestConfig()`

### `POST /kg/v1/tools/blw-test/submit`
- **Status:** ❌ **Fixed in this PR** — `blw-service.ts` was posting to `/tools/blw-test` (wrong)
- **Mobile constant:** `BLW_TEST_SUBMIT` (`src/lib/constants.ts:150`)
- **Auth:** Required
- **Body:** `{ answers: Record<string, boolean>, child_id: string | number }`
- **Mobile usage:** `blw-service.ts:submitBLWTest()`, `tool-service.ts:submitBLWTest()`

### `GET /kg/v1/tools/blw-test/results`
- **Status:** ✅
- **Mobile constant:** `TOOL_BLW_RESULTS` (`src/lib/constants.ts:148`)
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `tool-service.ts:getBLWTestResults()`, `blw-service.ts:getBLWTestResults()`

### `POST /kg/v1/tools/percentile/calculate`
- **Status:** ✅
- **Mobile constant:** `PERCENTILE_CALCULATE` (`src/lib/constants.ts:155`)
- **Auth:** Not required (public use case)
- **Body:** `PercentileMeasurement`
- **Mobile usage:** `tool-service.ts:calculatePercentile()`

### `POST /kg/v1/tools/percentile/save`
- **Status:** ✅
- **Mobile constant:** `PERCENTILE_SAVE` (`src/lib/constants.ts:156`)
- **Auth:** Required (supports `?register=true` for anonymous users)
- **Body:** `PercentileResult` + `child_id?`
- **Mobile usage:** `tool-service.ts:savePercentileResult()`, `savePercentileWithRegistration()`

### `GET /kg/v1/tools/percentile/results`
- **Status:** ✅
- **Mobile constant:** `TOOL_PERCENTILE_RESULTS` (`src/lib/constants.ts:154`)
- **Auth:** Required
- **Query params:** `child_id?`
- **Mobile usage:** `tool-service.ts:getPercentileResults()`, `growth-service.ts:getPercentileResult()`

### `GET /kg/v1/tools/solid-food-readiness/config`
- **Status:** ✅
- **Mobile constants:** `SOLID_FOOD_READINESS_CONFIG`, `SOLID_FOOD_CONFIG` (identical, `src/lib/constants.ts:161,164`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getSolidFoodReadinessConfig()`

### `POST /kg/v1/tools/solid-food-readiness/submit`
- **Status:** ❌ **Fixed in this PR** — `blw-service.ts:submitSolidFoodCheck()` was posting to `/tools/solid-food-readiness` (wrong)
- **Mobile constants:** `SOLID_FOOD_READINESS_SUBMIT`, `SOLID_FOOD_SUBMIT` (identical, `src/lib/constants.ts:162,165`)
- **Auth:** Required
- **Body:** `{ answers: Record<string, boolean>, child_id? }` (tool-service) or `{ factors: Record<string, boolean>, child_id }` (blw-service)
- **Mobile usage:** `tool-service.ts:submitSolidFoodReadiness()`, `blw-service.ts:submitSolidFoodCheck()`
- **Notes:** Two services have slightly different payload shapes — `answers` vs `factors`. Backend should accept both or the canonical one.

### `GET /kg/v1/tools/solid-food-readiness/results`
- **Status:** ✅
- **Mobile constant:** `TOOL_SOLID_FOOD_RESULTS` (`src/lib/constants.ts:160`)
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `tool-service.ts:getSolidFoodReadiness()`, `blw-service.ts:getSolidFoodReadiness()`

### `GET /kg/v1/tools/water-need/calculate`
- **Status:** ⚠️ Verification needed — `TOOLS_PORT_AUDIT.md` listed this as `/tools/water-calculator`
- **Mobile constant:** `WATER_CALCULATOR` (`src/lib/constants.ts:168`)
- **Auth:** Not required
- **Query params:** `age_months`, `weight_kg?`, `feeding_type?`
- **Mobile usage:** `tool-service.ts:calculateWaterNeed()`

### `GET /kg/v1/tools/allergen-planner/config`
- **Status:** ✅
- **Mobile constant:** `ALLERGEN_PLANNER_CONFIG` (`src/lib/constants.ts:171`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getAllergenPlannerConfig()`

### `POST /kg/v1/tools/allergen-planner/generate`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `ALLERGEN_PLANNER_GENERATE` (`src/lib/constants.ts:172`)
- **Auth:** Required
- **Body:** `AllergenPlannerInput`
- **Mobile usage:** `tool-service.ts:generateAllergenPlan()`

### `GET /kg/v1/tools/food-trials`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_TRIALS` (`src/lib/constants.ts:177`)
- **Auth:** Required
- **Mobile usage:** `tool-service.ts:getFoodTrials()`

### `POST /kg/v1/tools/food-trials`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `FOOD_TRIALS`, `FOOD_TRIAL_ADD` (identical, `src/lib/constants.ts:177,181`)
- **Auth:** Required
- **Body:** `FoodTrialInput`
- **Mobile usage:** `tool-service.ts:createFoodTrial()`

### `PUT /kg/v1/tools/food-trials/{id}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_TRIAL(id)` (`src/lib/constants.ts:178`)
- **Auth:** Required
- **Mobile usage:** `tool-service.ts:updateFoodTrial()`

### `DELETE /kg/v1/tools/food-trials/{id}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_TRIAL(id)` (`src/lib/constants.ts:178`)
- **Auth:** Required
- **Mobile usage:** `tool-service.ts:deleteFoodTrial()`

### `GET /kg/v1/tools/food-trials/summary`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_TRIAL_SUMMARY` (`src/lib/constants.ts:179`)
- **Auth:** Required
- **Mobile usage:** `tool-service.ts:getFoodTrialSummary()`

### `GET /kg/v1/tools/bath-planner/config`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `BATH_PLANNER_CONFIG` (`src/lib/constants.ts:184`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getBathPlannerConfig()`

### `POST /kg/v1/tools/bath-planner/generate`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `BATH_PLANNER_GENERATE` (`src/lib/constants.ts:185`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:generateBathPlan()`

### `POST /kg/v1/tools/hygiene-calculator/calculate`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `HYGIENE_CALCULATOR` (`src/lib/constants.ts:188`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:calculateHygiene()`

### `POST /kg/v1/tools/diaper-calculator/calculate`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `DIAPER_CALCULATOR` (`src/lib/constants.ts:191`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:calculateDiapers()`

### `POST /kg/v1/tools/diaper-calculator/rash-risk`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `DIAPER_RASH_RISK` (`src/lib/constants.ts:192`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:calculateRashRisk()`

### `POST /kg/v1/tools/air-quality/analyze`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `AIR_QUALITY_ANALYZE` (`src/lib/constants.ts:195`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:analyzeAirQuality()`

### `GET /kg/v1/tools/stain-encyclopedia/search`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constants:** `STAIN_ENCYCLOPEDIA_SEARCH`, `STAIN_SEARCH` (identical, `src/lib/constants.ts:198,201`)
- **Auth:** Not required
- **Query params:** `q`
- **Response:** `{ stains: StainGuide[] }`
- **Mobile usage:** `tool-service.ts:searchStains()`

### `GET /kg/v1/tools/stain-encyclopedia/{slug}`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constants:** `STAIN_ENCYCLOPEDIA_BY_SLUG(slug)`, `STAIN_BY_SLUG(slug)` (identical, `src/lib/constants.ts:199,202`)
- **Auth:** Not required
- **Mobile usage:** `tool-service.ts:getStainBySlug()`

### `GET /kg/v1/tools/{slug}/sponsor`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `TOOL_SPONSOR_BY_SLUG(slug)` (`src/lib/constants.ts:206`)
- **Auth:** Not required
- **Mobile usage:** `sponsored-tool-service.ts:getSponsoredTool()`

### `GET /kg/v1/tools/sponsored`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SPONSORED_TOOLS` (`src/lib/constants.ts:205`)
- **Auth:** Not required
- **Mobile usage:** `sponsored-tool-service.ts:getSponsoredTools()`

---

## 9. Community (Circles, Discussions, Comments)

### `GET /kg/v1/circles`
- **Status:** ✅
- **Mobile constant:** `CIRCLES` (`src/lib/constants.ts:254`)
- **Auth:** Not required
- **Response:** `Circle[]` or `{ circles: [] }` (both handled)
- **Mobile usage:** `community-service.ts:getCircles()`

### `GET /kg/v1/user/circles`
- **Status:** ✅
- **Mobile constant:** `USER_CIRCLES` (`src/lib/constants.ts:257`)
- **Auth:** Required
- **Mobile usage:** `community-service.ts:getUserCircles()`

### `POST /kg/v1/user/circles`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_CIRCLES` (`src/lib/constants.ts:257`)
- **Auth:** Required
- **Body:** `{ circle_ids: number[] }`
- **Mobile usage:** `community-service.ts:updateUserCircles()`

### `POST /kg/v1/circles/{id}/follow`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CIRCLE_FOLLOW(id)` (`src/lib/constants.ts:255`)
- **Auth:** Required
- **Mobile usage:** `community-service.ts:followCircle()`

### `POST /kg/v1/circles/{id}/unfollow`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CIRCLE_UNFOLLOW(id)` (`src/lib/constants.ts:256`)
- **Auth:** Required
- **Mobile usage:** `community-service.ts:unfollowCircle()`

### `GET /kg/v1/discussions`
- **Status:** ✅
- **Mobile constant:** `DISCUSSIONS` (`src/lib/constants.ts:258`)
- **Auth:** Not required
- **Query params:** `circle_id?`, `search?`, `page?`, `per_page?`, `sort?`, `order?`
- **Response:** `DiscussionsResponse` or `Discussion[]` (both handled)
- **Mobile usage:** `community-service.ts:getDiscussions()`

### `POST /kg/v1/discussions`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `DISCUSSIONS` (`src/lib/constants.ts:258`)
- **Auth:** Required
- **Body:** `CreateDiscussionRequest`
- **Mobile usage:** `community-service.ts:createDiscussion()`

### `GET /kg/v1/discussions/{id}`
- **Status:** ✅
- **Mobile constant:** `DISCUSSION_BY_ID(id)` (`src/lib/constants.ts:259`)
- **Auth:** Not required
- **Mobile usage:** `community-service.ts:getDiscussionById()`

### `GET /kg/v1/discussions/{id}/comments`
- **Status:** ✅
- **Mobile constant:** `DISCUSSION_COMMENTS(id)` (`src/lib/constants.ts:261`)
- **Auth:** Not required
- **Response:** `DiscussionComment[]` or `{ comments: [] }` (both handled)
- **Mobile usage:** `community-service.ts:getDiscussionComments()`

### `POST /kg/v1/discussions/{id}/comments`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `DISCUSSION_COMMENTS(id)` (`src/lib/constants.ts:261`)
- **Auth:** Required
- **Body:** `{ content: string, parent_id?: number }`
- **Mobile usage:** `community-service.ts:addComment()`

### `GET /kg/v1/user/discussions`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_DISCUSSIONS` (`src/lib/constants.ts:262`)
- **Auth:** Required
- **Mobile usage:** `community-service.ts:getUserDiscussions()`

### `GET /kg/v1/feed`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FEED` (`src/lib/constants.ts:263`)
- **Auth:** Required
- **Query params:** `page`, `per_page`
- **Mobile usage:** `community-service.ts:getPersonalizedFeed()`

### `GET /kg/v1/community/top-contributors`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `TOP_CONTRIBUTORS` (`src/lib/constants.ts:264`)
- **Auth:** Not required
- **Query params:** `limit`
- **Mobile usage:** `community-service.ts:getTopContributors()`

### `POST /kg/v1/discussions/{id}/vote`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `DISCUSSION_VOTE(id)` (`src/lib/constants.ts:265`)
- **Auth:** Required
- **Body:** `{ vote: 'up' | 'down' }`
- **Mobile usage:** `community-service.ts:voteDiscussion()`

### `POST /kg/v1/comments/{id}/vote`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `COMMENT_VOTE(id)` (`src/lib/constants.ts:266`)
- **Auth:** Required
- **Body:** `{ vote: 'up' | 'down' }`
- **Mobile usage:** `community-service.ts:voteComment()`

### `POST /kg/v1/report`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `COMMUNITY_REPORT`, `REPORT` (identical, `src/lib/constants.ts:267,268`)
- **Auth:** Required
- **Body:** `{ content_type: 'discussion' | 'comment', content_id: number, reason: string }`
- **Mobile usage:** `community-service.ts:reportContent()`

### `POST /kg/v1/comments`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `COMMENTS` (`src/lib/constants.ts:115`)
- **Auth:** Required
- **Body:** `{ post_id: number, content: string }`
- **Mobile usage:** `comment-service.ts:addBlogComment()`

---

## 10. Vaccines & Growth & BLW

### `GET /kg/v1/health/vaccines/master`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `VACCINES_MASTER` (`src/lib/constants.ts:127`)
- **Auth:** Not required
- **Response:** `Vaccine[]` or `{ items/vaccines/data: [] }` (all handled)
- **Mobile usage:** `vaccine-service.ts:getVaccines()`

### `GET /kg/v1/health/vaccines`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `VACCINES_BY_CHILD(childId)` → `/health/vaccines?child_id={id}`
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `vaccine-service.ts:getVaccinesByChild()`

### `POST /kg/v1/health/vaccines/mark-done`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `VACCINES_MARK_DONE` (`src/lib/constants.ts:129`)
- **Auth:** Required
- **Body:** `{ vaccine_id: number, child_id: string, date_administered?: string }`
- **Mobile usage:** `vaccine-service.ts:markVaccineDone()`

### `GET /kg/v1/health/vaccines/schedule-versions`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_SCHEDULE_VERSIONS` (`src/lib/constants.ts:130`)

### `POST /kg/v1/health/vaccines/update-status`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_UPDATE_STATUS` (`src/lib/constants.ts:131`)

### `POST /kg/v1/health/vaccines/private/add`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_ADD_PRIVATE` (`src/lib/constants.ts:132`)

### `GET /kg/v1/health/vaccines/side-effects`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_SIDE_EFFECTS` (`src/lib/constants.ts:133`)

### `GET /kg/v1/health/vaccines/upcoming`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_UPCOMING(childId)` (`src/lib/constants.ts:134`)

### `GET /kg/v1/health/vaccines/history`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `VACCINES_HISTORY(childId)` (`src/lib/constants.ts:135`)

### `GET /kg/v1/health/growth`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `GROWTH_DATA`, `GROWTH_RECORD(childId)` (`src/lib/constants.ts:209-210`)
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `growth-service.ts:getGrowthData()`

### `POST /kg/v1/health/growth`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `GROWTH_ADD` (`src/lib/constants.ts:211`)
- **Auth:** Required
- **Body:** `GrowthRecord` (without id)
- **Mobile usage:** `growth-service.ts:addGrowthRecord()`

---

## 11. Search & Featured

### `GET /kg/v1/search`
- **Status:** ✅
- **Mobile constants:** `SEARCH`, `SEARCH_ALL` (identical, `src/lib/constants.ts:78,79`)
- **Auth:** Not required
- **Query params:** `q`, `type?`, `per_page?`, `age_group?`
- **Response:** `{ success, query, type, results, categorized: { recipes, ingredients, posts, discussions }, counts, total }`
- **Mobile usage:** `search-service.ts:searchService.search()`

### `GET /kg/v1/recommendations/daily`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `RECOMMENDATIONS`, `RECOMMENDATIONS_DAILY` (identical, `src/lib/constants.ts:82,83`)
- **Auth:** Required
- **Query params:** `child_id?`
- **Mobile usage:** `recommendation-service.ts:getRecommendations()`

### `GET /kg/v1/recommendations/dashboard`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `RECOMMENDATIONS_DASHBOARD` (`src/lib/constants.ts:84`)
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `recommendation-service.ts:getDashboardRecommendations()`

### `GET /kg/v1/recommendations/recipes`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `RECOMMENDATIONS_RECIPES` (`src/lib/constants.ts:85`)

### `GET /kg/v1/featured`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `FEATURED`, `FEATURED_ALL` (identical, `src/lib/constants.ts:138,139`)
- **Auth:** Not required
- **Mobile usage:** `featured-service.ts:getAllFeatured()`

### `GET /kg/v1/cross-sell/banner`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CROSS_SELL_BANNER` (`src/lib/constants.ts:221`)
- **Auth:** Not required
- **Mobile usage:** `featured-service.ts:getCrossSellBanner()`

### `GET /kg/v1/nutrition/weekly-summary`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `NUTRITION_WEEKLY_SUMMARY` (`src/lib/constants.ts:90`)
- **Auth:** Required
- **Query params:** `child_id`, `period?` ('day'|'week'|'month')
- **Mobile usage:** `nutrition-service.ts:getNutritionSummary()`

### `GET /kg/v1/nutrition/missing-nutrients`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `NUTRITION_MISSING`, `NUTRITION_MISSING_NUTRIENTS` (identical, `src/lib/constants.ts:91,92`)
- **Auth:** Required
- **Query params:** `child_id`
- **Mobile usage:** `nutrition-service.ts:getMissingNutrients()`

---

## 12. Notifications

### `GET /kg/v1/notifications/preferences`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `NOTIFICATION_PREFERENCES` (`src/lib/constants.ts:241`)

### `POST /kg/v1/notifications/push/subscribe`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `PUSH_SUBSCRIBE` (`src/lib/constants.ts:242`)

### `POST /kg/v1/notifications/push/unsubscribe`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `PUSH_UNSUBSCRIBE` (`src/lib/constants.ts:243`)

---

## 13. Ingredients & Safety

### `GET /kg/v1/ingredients`
- **Status:** ✅
- **Mobile constants:** `INGREDIENTS`, `INGREDIENTS_ALL` (identical, `src/lib/constants.ts:101,102`)
- **Auth:** Not required
- **Query params:** `page`, `per_page`, `category`, `season`
- **Mobile usage:** `ingredient-service.ts:getIngredients()`

### `GET /kg/v1/ingredients/{slug}`
- **Status:** ✅
- **Mobile constant:** `INGREDIENT_BY_SLUG(slug)` (`src/lib/constants.ts:103`)
- **Auth:** Not required
- **Mobile usage:** `ingredient-service.ts:getIngredientBySlug()`

### `GET /kg/v1/ingredients/search`
- **Status:** ⚠️ Verification needed
- **Mobile constants:** `INGREDIENT_SEARCH`, `INGREDIENTS_SEARCH` (identical, `src/lib/constants.ts:104,106`)
- **Auth:** Not required
- **Query params:** `q`
- **Mobile usage:** `ingredient-service.ts:searchIngredients()`

### `GET /kg/v1/ingredient-categories`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `INGREDIENT_CATEGORIES` (`src/lib/constants.ts:107`)
- **Auth:** Not required
- **Mobile usage:** `ingredient-service.ts`

### `POST /kg/v1/safety/check-ingredient`
- **Status:** ✅ (per TOOLS_PORT_AUDIT.md)
- **Mobile constant:** `SAFETY_CHECK_INGREDIENT` (`src/lib/constants.ts:96`)
- **Auth:** Not required
- **Body:** `{ ingredient_id: number|string, child_id: number }` or `{ ingredient: string, age_months: number }` (legacy)
- **Mobile usage:** `safety-service.ts:checkIngredient()`

### `POST /kg/v1/safety/check-recipe`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SAFETY_CHECK_RECIPE` (`src/lib/constants.ts:97`)
- **Auth:** Not required
- **Body:** `{ recipe_id: number, child_id: number }`
- **Mobile usage:** `safety-service.ts:checkRecipe()`

### `POST /kg/v1/safety/batch-check`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `SAFETY_BATCH_CHECK` (`src/lib/constants.ts:98`)
- **Auth:** Not required
- **Body:** `{ recipe_ids: number[], child_id: number }`
- **Mobile usage:** `safety-service.ts:batchCheckRecipes()`

### `GET /kg/v1/allergens`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `ALLERGENS` (`src/lib/constants.ts:214`)
- **Auth:** Not required
- **Mobile usage:** `allergen-service.ts:getAllergens()`

### `GET /kg/v1/user/children/{id}/allergens`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CHILD_ALLERGENS(childId)` (`src/lib/constants.ts:215`)
- **Auth:** Required
- **Mobile usage:** `allergen-service.ts:getChildAllergens()`

### `POST /kg/v1/user/children/{id}/allergens`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CHILD_ALLERGENS(childId)` (`src/lib/constants.ts:215`)
- **Auth:** Required
- **Body:** `{ allergen_id: number, severity? }`
- **Mobile usage:** `allergen-service.ts:addChildAllergen()`

---

## 14. Misc

### `POST /kg/v1/contact`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `CONTACT` (`src/lib/constants.ts:119`)
- **Auth:** Not required
- **Body:** `{ name, email, subject?, message }`
- **Mobile usage:** `contact-service.ts`

### `POST /kg/v1/newsletter/subscribe`
- **Status:** ❌ **Fixed in this PR** — was hardcoded string, now uses `NEWSLETTER_SUBSCRIBE` constant
- **Mobile constants:** `NEWSLETTER` → `/kg/v1/newsletter`, `NEWSLETTER_SUBSCRIBE` → `/kg/v1/newsletter/subscribe`
- **Auth:** Not required
- **Body:** `{ email, name?, source, interests? }`
- **Mobile usage:** `newsletter-service.ts:subscribeNewsletter()`

### `GET /kg/v1/food-introduction/suggested`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_INTRODUCTION_SUGGESTED` (`src/lib/constants.ts:123`)
- **Auth:** Not required
- **Mobile usage:** `food-introduction-service.ts:getFoodIntroductionItems()`

### `GET /kg/v1/food-introduction/next-suggestion`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `FOOD_INTRODUCTION_NEXT` (`src/lib/constants.ts:124`)
- **Auth:** Not required
- **Mobile usage:** `food-introduction-service.ts:getNextFoodSuggestion()`

### `GET /kg/v1/experts`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `EXPERTS_LIST` (`src/lib/constants.ts:237`)
- **Auth:** Not required
- **Mobile usage:** `user-service.ts:getExperts()`

### `GET /kg/v1/expert/public/{username}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `EXPERT_PUBLIC(username)` (`src/lib/constants.ts:236`)
- **Auth:** Not required
- **Mobile usage:** `user-service.ts:getExpertPublicProfile()`

### `GET /kg/v1/user/public/{username}`
- **Status:** ⚠️ Verification needed
- **Mobile constant:** `USER_PUBLIC(username)` (`src/lib/constants.ts:235`)
- **Auth:** Not required
- **Mobile usage:** `user-service.ts:getPublicProfile()`

### `GET /kg/v1/expert/dashboard`
- **Status:** 🆕 Constant defined, no active service function
- **Mobile constant:** `EXPERT_DASHBOARD` (`src/lib/constants.ts:238`)

---

## PR Test Evidence

### Table 1: Fixes in This PR

| Endpoint | Before | After | Reason | Affected Service |
|---|---|---|---|---|
| BLW Test submit | `POST /kg/v1/tools/blw-test` | `POST /kg/v1/tools/blw-test/submit` | Wrong path — missing `/submit` sub-route | `blw-service.ts:submitBLWTest` |
| Solid Food submit | `POST /kg/v1/tools/solid-food-readiness` | `POST /kg/v1/tools/solid-food-readiness/submit` | Wrong path — missing `/submit` sub-route | `blw-service.ts:submitSolidFoodCheck` |
| Newsletter subscribe | Hardcoded `/kg/v1/newsletter/subscribe` | `API_ENDPOINTS.NEWSLETTER_SUBSCRIBE` | Inline string instead of constant | `newsletter-service.ts:subscribeNewsletter` |
| BLW Test `child_id` type | `child_id: number` | `child_id: string \| number` | Child IDs are UUIDs (strings); type was wrong | `blw-service.ts` |

### Table 2: Verified Working Endpoints (Regression Protection)

| Flow | Endpoint | Status |
|---|---|---|
| Profil görüntüleme | `GET /kg/v1/user/me` | ✅ Confirmed — constant and service unchanged |
| Profil güncelleme | `PUT /kg/v1/user/profile` | ✅ Confirmed — constant and service unchanged |
| Header avatar | `POST /kg/v1/user/avatar` | ✅ Confirmed — constant and service unchanged |
| Çocuk listeleme | `GET /kg/v1/user/children` | ✅ Confirmed — constant and service unchanged |
| Çocuk ekleme | `POST /kg/v1/user/children` | ✅ Confirmed — constant and service unchanged |
| Çocuk düzenleme | `PUT /kg/v1/user/children/{uuid}` | ✅ Confirmed — constant and service unchanged |
| Rıza okuma | `GET /kg/v1/user/consents` | ✅ Confirmed — constant and service unchanged |
| Rıza güncelleme | `PUT /kg/v1/user/consents/{type}` | ✅ Confirmed — constant and service unchanged |

### Table 3: Backend-Ready Endpoints Not Yet Used in Mobile

| Endpoint | Backend Source | Suggested Mobile Use |
|---|---|---|
| `GET /kg/v1/health/vaccines/upcoming` | `VACCINES_UPCOMING(childId)` | Vaccines screen — upcoming vaccinations widget |
| `GET /kg/v1/health/vaccines/history` | `VACCINES_HISTORY(childId)` | Vaccines screen — vaccination history |
| `GET /kg/v1/health/vaccines/side-effects` | `VACCINES_SIDE_EFFECTS` | Vaccines screen — side effects info |
| `POST /kg/v1/health/vaccines/update-status` | `VACCINES_UPDATE_STATUS` | More granular vaccine status updates |
| `POST /kg/v1/health/vaccines/private/add` | `VACCINES_ADD_PRIVATE` | Add custom/private vaccines |
| `GET /kg/v1/notifications/preferences` | `NOTIFICATION_PREFERENCES` | Push notification settings screen |
| `POST /kg/v1/notifications/push/subscribe` | `PUSH_SUBSCRIBE` | Push notification registration |
| `GET /kg/v1/recommendations/recipes` | `RECOMMENDATIONS_RECIPES` | Recipe recommendation widget |
| `POST /kg/v1/auth/forgot-password` | `AUTH_FORGOT_PASSWORD` | Password reset flow |
| `GET /kg/v1/expert/dashboard` | `EXPERT_DASHBOARD` | Expert-only dashboard screen |
| `GET /kg/v1/meal-plans/active` | `MEAL_PLANS_ACTIVE(childId)` | Active meal plan per-child query |
| `POST /kg/v1/meal-plans/{id}/slots/{slot}/refresh` | `MEAL_PLAN_REFRESH_SLOT` | Meal plan slot regeneration |
