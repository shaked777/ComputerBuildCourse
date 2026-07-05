import type { DayLog } from '../types'

/** Local-timezone day key: YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add n days (may be negative) to an ISO day key. */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

/**
 * Current study streak in days. Anchored at today, or at yesterday if the user
 * hasn't studied yet today (so an active streak isn't shown as broken at 8am).
 */
export function streakDays(daily: Record<string, DayLog>): number {
  let cursor = dayKey()
  if (!daily[cursor]?.answered) cursor = addDays(cursor, -1)
  let streak = 0
  while (daily[cursor] && daily[cursor].answered > 0) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export interface DayPoint {
  key: string
  /** 0=Sunday … 6=Saturday, for weekday labels. */
  weekday: number
  xp: number
  answered: number
}

/** The last n days (oldest → newest), zero-filled where there was no activity. */
export function lastNDays(daily: Record<string, DayLog>, n = 7): DayPoint[] {
  const out: DayPoint[] = []
  const today = dayKey()
  for (let i = n - 1; i >= 0; i--) {
    const key = addDays(today, -i)
    const log = daily[key]
    out.push({
      key,
      weekday: new Date(`${key}T12:00:00`).getDay(),
      xp: log?.xp ?? 0,
      answered: log?.answered ?? 0,
    })
  }
  return out
}
