import raw from '../data/questions.json'
import type { Question, ModuleId } from '../types'
import { MODULES } from '../data/modules'
import { EXTRA_QUESTIONS } from '../data/extraQuestions'
import { INTERACTIVE_QUESTIONS } from '../data/interactiveQuestions'

/** Full raw bank: generated JSON + curated diagram questions + interactive questions. */
const RAW_QUESTIONS: Question[] = [
  ...(raw as unknown as Question[]),
  ...EXTRA_QUESTIONS,
  ...INTERACTIVE_QUESTIONS,
]

/** Strip "(גרסה N)" markers and collapse whitespace for clean display + dedupe keys. */
function normalizeText(t: string): string {
  return t
    .replace(/\(גרסה \d+\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * The served bank: de-duplicated (the generated bank contains near-identical
 * "גרסה 1/2" variants with the same answer) with cleaned question text.
 */
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

/** All served questions belonging to a chapter (across all of its topics). */
export function questionsForModule(moduleId: ModuleId): Question[] {
  const def = MODULES.find((m) => m.id === moduleId)
  if (!def || def.topics.length === 0) return []
  const topics = new Set(def.topics)
  return ALL_QUESTIONS.filter((q) => topics.has(q.topic))
}

export function moduleQuestionCount(moduleId: ModuleId): number {
  return questionsForModule(moduleId).length
}

/** Resolve which chapter a question belongs to, via its topic string. */
export function moduleIdForTopic(topic: string): ModuleId {
  const def = MODULES.find((m) => m.topics.includes(topic))
  // Every question maps to a known topic; fall back to the first chapter.
  return def ? def.id : MODULES[0].id
}
