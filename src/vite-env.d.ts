/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_PORT: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_ENABLE_DEBUG_OVERLAY: string;
  readonly VITE_LEVELS_BASE_URL: string;
  readonly VITE_ANALYTICS_ENABLED: string;
  readonly VITE_ANALYTICS_ENDPOINT: string;
  readonly VITE_CRASH_REPORT_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
