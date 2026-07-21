import { createApp } from "vue";
import "./styles/tailwind.css";
import "./styles/thesis-theme.css";
import App from "./App.vue";
import { getAuthToken } from "./composables/useAuthSession";
import { getApiBaseUrl } from "./config/runtimeConfig";
import { i18n } from "./plugins/i18n";
import { router } from "./router";
import { vuetify } from "./plugins/vuetify";

const apiBaseUrl = getApiBaseUrl();

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const setupLocaleHeaderInterceptor = () => {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const resolvedUrl = /^https?:\/\//i.test(requestUrl)
      ? requestUrl
      : `${apiBaseUrl}${requestUrl.startsWith("/") ? requestUrl : `/${requestUrl}`}`;
    const headers = new Headers(
      input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      const initHeaders = new Headers(init.headers);
      initHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (!headers.has("Accept-Language")) {
      const locale = i18n.global.locale.value === "en" ? "en" : "pl";
      headers.set("Accept-Language", locale);
    }

    const requestMethod = (
      init?.method ?? (input instanceof Request ? input.method : "GET")
    ).toUpperCase();
    const token = getAuthToken();
    const isApiRequest = resolvedUrl.startsWith(`${apiBaseUrl}/api/`);
    if (token && isApiRequest && !headers.has("Authorization"))
      headers.set("Authorization", `Bearer ${token}`);

    if (isApiRequest && !headers.has("Idempotency-Key"))
      headers.set("Idempotency-Key", createIdempotencyKey());

    return originalFetch(resolvedUrl, {
      ...init,
      method: requestMethod,
      headers,
    });
  };
};

setupLocaleHeaderInterceptor();

createApp(App).use(vuetify).use(i18n).use(router).mount("#app");
