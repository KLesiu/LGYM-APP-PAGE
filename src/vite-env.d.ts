/// <reference types="vite/client" />

declare global {
  interface Window {
    __LGYM_RUNTIME_CONFIG__?: {
      apiBaseUrl?: string;
      googleClientId?: string;
    };
  }
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

export {};
