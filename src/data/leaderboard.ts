import type { LeaderRow } from '../types'

/** Mock competitive "AI" players the human is ranked against. */
export const MOCK_PLAYERS: { name: string; xp: number }[] = [
  { name: 'אלגוריתם_מהיר', xp: 520 },
  { name: 'ביט_מאסטר', xp: 410 },
  { name: 'קוד_נינגה', xp: 300 },
  { name: 'מעבד_על', xp: 160 },
]

/** Build the live leaderboard, inserting the player by their current XP. */
export function buildLeaderboard(username: string, userXp: number): LeaderRow[] {
  const rows: LeaderRow[] = [
    ...MOCK_PLAYERS.map((p) => ({ ...p, you: false })),
    { name: username, xp: userXp, you: true },
  ]
  return rows.sort((a, b) => b.xp - a.xp || (a.you ? 1 : 0) - (b.you ? 1 : 0))
}
