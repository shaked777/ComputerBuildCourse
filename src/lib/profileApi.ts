import type { ProgressState } from '../types'
import { getSupabase, getPlayerId } from './supabase'

const TABLE = 'profiles'

/**
 * Cloud backup of the full progress state, keyed by the anonymous playerId.
 * Progress always lives in localStorage first; the cloud copy makes it survive
 * browser-storage eviction (e.g. Safari clearing site data) on the same device.
 */
export async function saveProgressToCloud(state: ProgressState): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return
  await supabase.from(TABLE).upsert(
    {
      player_id: getPlayerId(),
      name: state.username,
      state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'player_id' },
  )
}

/** Fetch this player's cloud-saved progress, or null if none / unavailable. */
export async function loadProgressFromCloud(): Promise<ProgressState | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('state')
      .eq('player_id', getPlayerId())
      .maybeSingle()
    if (error || !data?.state) return null
    return data.state as ProgressState
  } catch {
    return null
  }
}
