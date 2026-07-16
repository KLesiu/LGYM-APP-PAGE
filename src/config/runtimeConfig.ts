const DEFAULT_API_BASE_URL = "https://localhost:7025";

type RuntimeConfig = {
  apiBaseUrl?: unknown;
  googleClientId?: unknown;
};

const getRuntimeConfig = (): RuntimeConfig => {
  if (typeof window === "undefined") return {};

  return window.__LGYM_RUNTIME_CONFIG__ ?? {};
};

const readString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const getApiBaseUrl = () =>
  (readString(getRuntimeConfig().apiBaseUrl) || DEFAULT_API_BASE_URL).replace(/\/$/, "");

export const getGoogleClientId = () => readString(getRuntimeConfig().googleClientId);
