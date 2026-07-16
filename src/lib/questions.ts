import raw from '../data/questions.json'
import basics from '../data/basicsQuestions.json'
import type { Question, ModuleId, QuestionLevel } from '../types'
import { MODULES } from '../data/modules'
import { EXTRA_QUESTIONS } from '../data/extraQuestions'
import { INTERACTIVE_QUESTIONS } from '../data/interactiveQuestions'

/**
 * Levels for the curated diagram/interactive questions (by id).
 * The exam bank defaults to level 3; the basics bank carries explicit levels.
 */
const LEVEL_OVERRIDES: Record<number, QuestionLevel> = {
  // extraQuestions — single-cycle (diagram-based)
  1001: 2, 1002: 2, 1003: 2, 1004: 2, 1005: 2, 1006: 3, 1007: 3, 1008: 3,
  1009: 3, 1010: 1, 1011: 3, 1012: 2,
  // extraQuestions — multi-cycle
  1051: 2, 1052: 2, 1053: 2, 1054: 2, 1055: 2, 1056: 3, 1057: 2, 1058: 3,
  1059: 3, 1060: 3, 1061: 3, 1062: 1,
  // interactiveQuestions (arrange / matching)
  2001: 1, 2002: 2, 2003: 2, 2051: 1, 2052: 1, 2053: 2,
  2101: 2, 2102: 2, 2103: 1, 2151: 2, 2152: 1, 2153: 1,
}

/** Full raw bank: exam questions + basics + curated diagram + interactive. */
const RAW_QUESTIONS: Question[] = [
  ...(raw as unknown as Question[]),
  ...(basics as unknown as Question[]),
  ...EXTRA_QUESTIONS,
  ...INTERACTIVE_QUESTIONS,
].map((q) => ({ ...q, level: q.level ?? LEVEL_OVERRIDES[q.id] ?? 3 }))

/** Strip "(גרסה N)" markers and collapse whitespace for clean display + dedupe keys. */
function normalizeText(t: string): string {
  return t
    .replace(/\(גרסה \d+\)/g, '')
    .replace(/[^\S\n]{2,}/g, ' ')
    .trim()
}

/** The served bank: de-duplicated with cleaned question text. */
export const ALL_QUESTIONS: Question[] = (() => {
  const seen = new Set<string>()
  const out: Question[] = []
  for (const q of RAW_QUESTIONS) {
    const key = `${normalizeText(q.question)}|${q.correct_answer}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...q, question: normalizeText(q.question) })
  }
  return out
})()

/** Lookup over the RAW bank so ids stored in old saves always resolve. */
const BY_ID = new Map<number, Question>(RAW_QUESTIONS.map((q) => [q.id, q]))

export function getQuestionById(id: number): Question | undefined {
  return BY_ID.get(id)
}

/** All served questions belonging to a chapter, optionally filtered by level. */
export function questionsForModule(moduleId: ModuleId, level?: QuestionLevel): Question[] {
  const def = MODULES.find((m) => m.id === moduleId)
  if (!def || def.topics.length === 0) return []
  const topics = new Set(def.topics)
  return ALL_QUESTIONS.filter(
    (q) => topics.has(q.topic) && (level === undefined || (q.level ?? 3) === level),
  )
}

export function moduleQuestionCount(moduleId: ModuleId, level?: QuestionLevel): number {
  return questionsForModule(moduleId, level).length
}

/** Resolve which chapter a question belongs to, via its topic string. */
export function moduleIdForTopic(topic: string): ModuleId {
  const def = MODULES.find((m) => m.topics.includes(topic))
  // Every question maps to a known topic; fall back to the first chapter.
  return def ? def.id : MODULES[0].id
}
