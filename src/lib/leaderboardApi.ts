import { getSupabase, getPlayerId } from './supabase'

const TABLE = 'leaderboard'
/** Only the top N players are shown. */
export const LEADERBOARD_SIZE = 5

export interface RemoteRow {
  player_id: string
  name: string
  xp: number
}

export interface LeaderboardResult {
  rows: RemoteRow[]
  playerId: string
  /** The player's true rank across ALL rows (1-based), even if outside the top N. */
  myRank: number
}

/** Upsert the player's current score. No-op when Supabase isn't configured. */
export async function submitScore(name: string, xp: number): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return
  const player_id = getPlayerId()
  await supabase
    .from(TABLE)
    .upsert({ player_id, name, xp, updated_at: new Date().toISOString() }, { onConflict: 'player_id' })
}

/**
 * Fetch the top rows plus the player's true global rank. Legacy seed bots
 * (player_id starting with "seed-") are excluded from both queries.
 * Returns null when Supabase isn't configured or the request fails.
 */
export async function fetchLeaderboard(
  myXp: number,
  limit = LEADERBOARD_SIZE,
): Promise<LeaderboardResult | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  try {
    const [top, rank] = await Promise.all([
      supabase
        .from(TABLE)
        .select('player_id,name,xp')
        .filter('player_id', 'not.like', 'seed-%')
        .order('xp', { ascending: false })
        .limit(limit),
      supabase
        .from(TABLE)
        .select('*', { count: 'exact', head: true })
        .filter('player_id', 'not.like', 'seed-%')
        .gt('xp', myXp),
    ])
    if (top.error) return null
    return {
      rows: (top.data ?? []) as RemoteRow[],
      playerId: getPlayerId(),
      myRank: (rank.count ?? 0) + 1,
    }
  } catch {
    return null
  }
}
