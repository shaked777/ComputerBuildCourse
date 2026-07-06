import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase is optional. If the two env vars aren't set, the whole app still
 * runs — the leaderboard just falls back to its local/mock mode. Set them in a
 * `.env` file (local) or your host's dashboard (Netlify/Vercel) to go live.
 *
 * The heavy client library is loaded lazily (dynamic import), so a project
 * without a database never ships it in the initial bundle.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let clientPromise: Promise<SupabaseClient> | null = null

/** Lazily create (and memoize) the Supabase client, or null when unconfigured. */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string, { auth: { persistSession: false } }),
    )
  }
  return clientPromise
}

const PLAYER_ID_KEY = 'assembly-quest:playerId'

/** A stable, anonymous per-browser id so a player updates their own row. */
export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}
