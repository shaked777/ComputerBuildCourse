import type { Question, SessionQuestion, ModuleId, SrsRecord } from '../types'
import { SESSION_SIZE, MODULES } from '../data/modules'
import { questionsForModule, getQuestionById, ALL_QUESTIONS } from './questions'
import { classifyQuestion } from './classify'
import { isDue } from './srs'
import { dayKey } from './stats'

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function toSessionQuestion(q: Question): SessionQuestion {
  return { ...q, shuffledOptions: shuffle(q.options) }
}

/**
 * Build a bite-sized session for a chapter, ordered by learning value:
 * 1. questions never answered correctly (new material),
 * 2. mastered questions whose spaced-repetition review is due,
 * 3. everything else as filler.
 */
export function buildModuleSession(
  moduleId: ModuleId,
  masteredIds: number[],
  srs: Record<number, SrsRecord>,
  count: number = SESSION_SIZE,
): SessionQuestion[] {
  const pool = questionsForModule(moduleId)
  const mastered = new Set(masteredIds)
  const today = dayKey()

  const fresh = pool.filter((q) => !mastered.has(q.id))
  const dueReview = pool.filter((q) => mastered.has(q.id) && isDue(srs[q.id], today))
  const rest = pool.filter((q) => mastered.has(q.id) && !isDue(srs[q.id], today))

  const picked = [...shuffle(fresh), ...shuffle(dueReview), ...shuffle(rest)].slice(
    0,
    Math.min(count, pool.length),
  )
  return shuffle(picked).map(toSessionQuestion)
}

/** Build a session from the "Review" (mistakes) bucket. */
export function buildReviewSession(
  mistakeIds: number[],
  count: number = SESSION_SIZE,
): SessionQuestion[] {
  const questions = shuffle(mistakeIds)
    .map(getQuestionById)
    .filter((q): q is Question => Boolean(q))
    .slice(0, count)
  return questions.map(toSessionQuestion)
}

/**
 * Ids of previously-answered questions whose spaced-repetition review is due
 * today (or overdue). Drives the "חזרות להיום" dashboard card — live.
 */
export function dueReviewIds(srs: Record<number, SrsRecord>): number[] {
  const today = dayKey()
  return Object.entries(srs)
    .filter(([, rec]) => rec.due <= today)
    .map(([id]) => Number(id))
    .filter((id) => getQuestionById(id) !== undefined)
}

/** Daily smart review: a session made only of SRS-due questions. */
export function buildDailyReviewSession(
  srs: Record<number, SrsRecord>,
  count: number = SESSION_SIZE,
): SessionQuestion[] {
  const questions = shuffle(dueReviewIds(srs))
    .map(getQuestionById)
    .filter((q): q is Question => Boolean(q))
    .slice(0, count)
  return questions.map(toSessionQuestion)
}

/**
 * Endless Survival: a freshly shuffled deck of the entire bank. The quiz tops
 * this up with more shuffled decks if a player ever runs the whole bank.
 */
export function buildSurvivalDeck(): SessionQuestion[] {
  return shuffle(ALL_QUESTIONS).map(toSessionQuestion)
}

/**
 * Exam simulation: a stratified sample across all chapters (at least one
 * question from every chapter that has content, the rest random), limited to
 * choice/fill layouts — matching real exam conditions.
 */
export function buildExam(count = 15): SessionQuestion[] {
  const eligible = new Set(
    ALL_QUESTIONS.filter((q) => {
      const kind = classifyQuestion(q)
      return kind === 'choice' || kind === 'fill'
    }).map((q) => q.id),
  )

  const picked: Question[] = []
  const taken = new Set<number>()

  for (const m of MODULES) {
    if (picked.length >= count) break
    const pool = shuffle(questionsForModule(m.id).filter((q) => eligible.has(q.id)))
    if (pool.length > 0) {
      picked.push(pool[0])
      taken.add(pool[0].id)
    }
  }

  for (const q of shuffle(ALL_QUESTIONS.filter((q) => eligible.has(q.id) && !taken.has(q.id)))) {
    if (picked.length >= count) break
    picked.push(q)
  }

  return shuffle(picked).map(toSessionQuestion)
}
