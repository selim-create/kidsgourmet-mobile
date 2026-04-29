/**
 * src/lib/tools/food-guide.ts
 *
 * Re-exports static reference data from src/data/food-guide.ts.
 * The actual data lives in data/ to make it clear this is static content,
 * not backend-driven business logic.
 *
 * TODO: When kg-core exposes a food-guide endpoint, replace src/data/food-guide.ts
 * with an API call in src/services/tool-service.ts and remove the static data.
 */
export * from '../../data/food-guide';
