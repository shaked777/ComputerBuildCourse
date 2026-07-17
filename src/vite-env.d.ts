/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (optional — enables the live leaderboard). */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon/public API key (safe to expose in the frontend). */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** SHA-256 hex of the admin passcode (enables the ?admin dashboard). */
  readonly VITE_ADMIN_CODE_HASH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
