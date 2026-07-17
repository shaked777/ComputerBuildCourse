import type { ProgressState } from '../types'
import { getSupabase } from './supabase'
import { streakDays } from './stats'
import { levelInfo } from './level'

/** One player row for the admin dashboard, derived from their cloud profile. */
export interface AdminPlayer {
  playerId: string
  name: string
  xp: number
  level: number
  answered: number
  accuracy: number
  streak: number
  stars: number
  examBest: number
  survivalBest: number
  achievements: number
  lastSeen: string | null
}

export interface AdminData {
  players: AdminPlayer[]
  totals: {
    players: number
    activeToday: number
    active7d: number
    answered: number
    duelsCreated: number
    duelsFinished: number
  }
}

/** SHA-256 hex of a string (for the admin passcode gate). */
export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Fetch and aggregate everything the admin dashboard shows. */
export async function fetchAdminData(): Promise<AdminData | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  try {
    const [profiles, boardOnly, duels] = await Promise.all([
      supabase.from('profiles').select('player_id,name,state,updated_at').order('updated_at', { ascending: false }).limit(500),
      supabase.from('leaderboard').select('player_id,name,xp,updated_at').limit(500),
      supabase.from('challenges').select('id,opponent_score'),
    ])
    if (profiles.error && boardOnly.error) return null

    const seen = new Map<string, AdminPlayer>()
    for (const row of profiles.data ?? []) {
      const s = (row.state ?? {}) as Partial<ProgressState>
      const answered = s.totalAnswered ?? 0
      const correct = s.totalCorrect ?? 0
      const stars = Object.values(s.modules ?? {}).reduce(
        (sum, m) => sum + ((m as { starLevels?: number[] }).starLevels?.length ?? 0),
        0,
      )
      seen.set(row.player_id, {
        playerId: row.player_id,
        name: row.name ?? s.username ?? '—',
        xp: s.xp ?? 0,
        level: levelInfo(s.xp ?? 0).level,
        answered,
        accuracy: answered > 0 ? Math.round((100 * correct) / answered) : 0,
        streak: streakDays(s.daily ?? {}),
        stars,
        examBest: s.examBest ?? 0,
        survivalBest: s.survivalBest ?? 0,
        achievements: s.achievements?.length ?? 0,
        lastSeen: row.updated_at ?? null,
      })
    }
    // Players who appear on the leaderboard but never synced a profile.
    for (const row of boardOnly.data ?? []) {
      if (seen.has(row.player_id) || row.player_id.startsWith('seed-')) continue
      seen.set(row.player_id, {
        playerId: row.player_id,
        name: row.name,
        xp: row.xp,
        level: levelInfo(row.xp).level,
        answered: 0,
        accuracy: 0,
        streak: 0,
        stars: 0,
        examBest: 0,
        survivalBest: 0,
        achievements: 0,
        lastSeen: row.updated_at ?? null,
      })
    }

    const players = [...seen.values()].sort((a, b) =>
      (b.lastSeen ?? '').localeCompare(a.lastSeen ?? ''),
    )
    const now = Date.now()
    const activeWithin = (ms: number) =>
      players.filter((p) => p.lastSeen && now - new Date(p.lastSeen).getTime() < ms).length
    const duelRows = duels.data ?? []
    return {
      players,
      totals: {
        players: players.length,
        activeToday: activeWithin(DAY_MS),
        active7d: activeWithin(7 * DAY_MS),
        answered: players.reduce((s, p) => s + p.answered, 0),
        duelsCreated: duelRows.length,
        duelsFinished: duelRows.filter((d) => d.opponent_score != null).length,
      },
    }
  } catch {
    return null
  }
}
