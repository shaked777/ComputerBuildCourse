import type { SrsRecord } from '../types'
import { addDays, dayKey } from './stats'

/**
 * Leitner spaced-repetition scheduler.
 * A correct answer promotes the question one box (longer interval);
 * a wrong answer demotes it to box 1 (due immediately).
 */

/** Review interval in days for each box (index = box). */
const INTERVALS: readonly number[] = [0, 0, 1, 2, 4, 7]
export const MAX_BOX = 5

export function nextSrs(prev: SrsRecord | undefined, correct: boolean, today: string = dayKey()): SrsRecord {
  const box = correct ? Math.min((prev?.box ?? 0) + 1, MAX_BOX) : 1
  return { box, due: addDays(today, INTERVALS[box] ?? 7) }
}

/** A question with no record, or whose due date has arrived, is due for review. */
export function isDue(record: SrsRecord | undefined, today: string = dayKey()): boolean {
  return !record || record.due <= today
}
