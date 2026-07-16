import type { LeaderRow } from '../types'

/**
 * Offline/demo fallback: with no database configured there are no other
 * players, so the board shows just you. The real shared board (top 5) comes
 * from Supabase via lib/leaderboardApi.ts.
 */
export function buildLeaderboard(username: string, userXp: number): LeaderRow[] {
  return [{ name: username, xp: userXp, you: true }]
}
