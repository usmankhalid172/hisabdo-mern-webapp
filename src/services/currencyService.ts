export const SUPPORTED_CURRENCIES = [
  "PKR",
  "USD",
  "AED",
  "SAR",
  "INR",
  "EUR",
  "GBP",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const BASE_CURRENCY: SupportedCurrency = "PKR";

const CURRENCY_STORAGE_KEY = "hisabdo_curr";
const FX_CACHE_STORAGE_KEY = "hisabdo_fx_rates_v1";
const DEFAULT_EXCHANGE_RATE_ENDPOINT =
  process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL ||
  "https://open.er-api.com/v6/latest/PKR";

export interface ExchangeRateApiResponse {
  result?: string;
  base_code?: string;
  time_next_update_unix?: number;
  rates?: Record<string, number>;
}

export interface CachedExchangeRates {
  baseCode: SupportedCurrency;
  rates: Record<SupportedCurrency, number>;
  nextUpdateAt: number;
  fetchedAt: number;
}

export interface ExchangeRateProvider {
  name: string;
  fetchRates: () => Promise<ExchangeRateApiResponse>;
}

const defaultProvider: ExchangeRateProvider = {
  name: "ExchangeRate-API Open Access",
  async fetchRates(): Promise<ExchangeRateApiResponse> {
    const response = await fetch(DEFAULT_EXCHANGE_RATE_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Exchange-rate provider returned HTTP ${response.status}.`
      );
    }

    return (await response.json()) as ExchangeRateApiResponse;
  },
};

let activeProvider: ExchangeRateProvider = defaultProvider;
let memoryCache: CachedExchangeRates | null = null;
let inFlightRatesPromise: Promise<CachedExchangeRates> | null = null;

export function configureExchangeRateProvider(
  provider: ExchangeRateProvider
): void {
  activeProvider = provider;
  clearExchangeRateCache();
}

export function resetExchangeRateProvider(): void {
  activeProvider = defaultProvider;
  clearExchangeRateCache();
}

export function clearExchangeRateCache(): void {
  memoryCache = null;
  inFlightRatesPromise = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(FX_CACHE_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return (
    typeof value === "string" &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

/**
 * Retrieves the current user's selected currency from existing Settings storage.
 * Works uniformly for Guest, Demo, and Authenticated account contexts.
 * Defaults to PKR if no valid alternative currency is selected.
 */
export function getUserCurrency(): SupportedCurrency {
  if (typeof window === "undefined") {
    return BASE_CURRENCY;
  }

  try {
    const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (isSupportedCurrency(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors and fall back to PKR
  }

  return BASE_CURRENCY;
}

export function roundCurrencyAmount(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function validateAndNormalizeRates(
  payload: ExchangeRateApiResponse
): CachedExchangeRates {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid exchange-rate response: expected an object.");
  }

  if (payload.result !== "success") {
    throw new Error("Exchange-rate provider did not return a success result.");
  }

  if (payload.base_code !== BASE_CURRENCY) {
    throw new Error(
      `Unexpected base currency "${String(payload.base_code)}" from exchange-rate provider; expected ${BASE_CURRENCY}.`
    );
  }

  if (!payload.rates || typeof payload.rates !== "object") {
    throw new Error("Invalid exchange-rate response: missing rates map.");
  }

  const nextUpdateUnix = Number(payload.time_next_update_unix);
  if (!Number.isFinite(nextUpdateUnix) || nextUpdateUnix <= 0) {
    throw new Error(
      "Invalid exchange-rate response: missing time_next_update_unix."
    );
  }

  const normalizedRates = {} as Record<SupportedCurrency, number>;
  for (const code of SUPPORTED_CURRENCIES) {
    const rawRate = payload.rates[code];
    if (typeof rawRate !== "number" || !Number.isFinite(rawRate) || rawRate <= 0) {
      throw new Error(
        `Exchange-rate response is missing a valid positive rate for ${code}.`
      );
    }
    normalizedRates[code] = rawRate;
  }

  return {
    baseCode: BASE_CURRENCY,
    rates: normalizedRates,
    nextUpdateAt: nextUpdateUnix * 1000,
    fetchedAt: Date.now(),
  };
}

function readStoredCache(): CachedExchangeRates | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(FX_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedExchangeRates>;
    if (
      parsed.baseCode !== BASE_CURRENCY ||
      typeof parsed.nextUpdateAt !== "number" ||
      !Number.isFinite(parsed.nextUpdateAt) ||
      !parsed.rates
    ) {
      return null;
    }

    for (const code of SUPPORTED_CURRENCIES) {
      const rate = parsed.rates[code];
      if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
        return null;
      }
    }

    return parsed as CachedExchangeRates;
  } catch {
    return null;
  }
}

function writeStoredCache(cache: CachedExchangeRates): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FX_CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Returns validated PKR-based exchange rates, using in-memory and localStorage
 * caches until the provider's time_next_update_unix expires.
 */
export async function getExchangeRates(): Promise<Record<SupportedCurrency, number>> {
  const now = Date.now();

  if (memoryCache && now < memoryCache.nextUpdateAt) {
    return memoryCache.rates;
  }

  const stored = readStoredCache();
  if (stored && now < stored.nextUpdateAt) {
    memoryCache = stored;
    return stored.rates;
  }

  if (inFlightRatesPromise) {
    const resolved = await inFlightRatesPromise;
    return resolved.rates;
  }

  inFlightRatesPromise = (async () => {
    try {
      const payload = await activeProvider.fetchRates();
      const validated = validateAndNormalizeRates(payload);
      memoryCache = validated;
      writeStoredCache(validated);
      return validated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown exchange-rate error";
      throw new Error(
        `Currency conversion unavailable (${message}). Please retry or switch currency to PKR.`
      );
    } finally {
      inFlightRatesPromise = null;
    }
  })();

  const result = await inFlightRatesPromise;
  return result.rates;
}

export async function getExchangeRate(
  currency?: SupportedCurrency
): Promise<number> {
  const target = currency ?? getUserCurrency();
  if (target === BASE_CURRENCY) {
    return 1;
  }
  const rates = await getExchangeRates();
  return rates[target];
}

/**
 * Converts a monetary amount stored in PKR into the target currency.
 * Returns the original amount untouched when targetCurrency is PKR.
 * Safely handles null, undefined, and invalid numeric inputs.
 */
export async function convertFromPKR(
  amount: number | string | null | undefined,
  targetCurrency?: SupportedCurrency
): Promise<number> {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  const currency = targetCurrency ?? getUserCurrency();
  if (currency === BASE_CURRENCY) {
    return numericAmount;
  }

  if (numericAmount === 0) {
    return 0;
  }

  const rates = await getExchangeRates();
  const rate = rates[currency];
  return roundCurrencyAmount(numericAmount * rate);
}

/**
 * Converts a monetary amount entered in the user's selected currency back to PKR
 * before saving to the database.
 * Returns the original amount untouched when sourceCurrency is PKR.
 * Safely handles null, undefined, and invalid numeric inputs.
 */
export async function convertToPKR(
  amount: number | string | null | undefined,
  sourceCurrency?: SupportedCurrency
): Promise<number> {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  const currency = sourceCurrency ?? getUserCurrency();
  if (currency === BASE_CURRENCY) {
    return numericAmount;
  }

  if (numericAmount === 0) {
    return 0;
  }

  const rates = await getExchangeRates();
  const rate = rates[currency];
  return roundCurrencyAmount(numericAmount / rate);
}
