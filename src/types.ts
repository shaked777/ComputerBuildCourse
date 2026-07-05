import type { LucideIcon } from 'lucide-react'

/** Interactive layout a question is rendered as. */
export type QuestionKind = 'choice' | 'fill' | 'arrange' | 'matching'

/** One term↔definition pair for a matching question. */
export interface MatchPair {
  term: string
  match: string
}

/** A single question, matching the shape of questions.json (+ optional extras). */
export interface Question {
  id: number
  topic: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  /** Optional diagram filename in /public/diagrams shown above the question. */
  image?: string
  /** Explicit interactive kind. If omitted, the engine classifies automatically. */
  kind?: QuestionKind
  /** arrange: the correct ordered tokens. */
  sequence?: string[]
  /** matching: the correct term↔definition pairs. */
  pairs?: MatchPair[]
}

/** A question prepared for a session: options pre-shuffled so position can't be memorized. */
export interface SessionQuestion extends Question {
  shuffledOptions: string[]
}

/** One node on the path = one course chapter. */
export type ModuleId =
  | 'abstraction'
  | 'representation'
  | 'boolean'
  | 'mips'
  | 'singlecycle'
  | 'multicycle'
  | 'pipeline'

/** Visual theme key applied to a chapter's quiz session. */
export type ThemeKey =
  | 'blueprint'
  | 'binary'
  | 'circuit'
  | 'terminal'
  | 'datapath'
  | 'pipeline'
  | 'neutral'

/** Static metadata describing one chapter node on the learning path. */
export interface ModuleDef {
  id: ModuleId
  /** Hebrew chapter marker, e.g. "פרק א" */
  chapter: string
  /** Exact `topic` strings from questions.json that feed this chapter (may be empty). */
  topics: string[]
  title: string
  subtitle: string
  icon: LucideIcon
  /** Solid accent color (hex) */
  accent: string
  /** Soft tint background (hex) */
  accentSoft: string
  /** Visual theme used inside the chapter's quiz. */
  theme: ThemeKey
}

export type NodeStatus = 'locked' | 'soon' | 'available' | 'in-progress' | 'completed'

export type QuizMode = 'path' | 'survival' | 'review'

/** Per-module persisted progress. */
export interface ModuleProgress {
  /** Unique question ids answered correctly at least once. */
  masteredIds: number[]
  /** Number of sessions cleared without running out of hearts. */
  passedSessions: number
}

/** Spaced-repetition record for one question (Leitner system). */
export interface SrsRecord {
  /** Box 1 (relearn) … 5 (long interval). */
  box: number
  /** ISO date (YYYY-MM-DD) when the question is due for review. */
  due: string
}

/** One day's study activity. */
export interface DayLog {
  answered: number
  correct: number
  xp: number
}

/** Whole-app persisted state. */
export interface ProgressState {
  username: string
  xp: number
  totalAnswered: number
  totalCorrect: number
  /** Sessions cleared without a single mistake. */
  perfectSessions: number
  /** Best Survival run (correct answers before the 2-minute timer ran out). */
  survivalBest: number
  /** Best exam-simulation grade (0–100). */
  examBest: number
  /** Chapters force-unlocked via the Crown (skip prerequisites). */
  unlocked: ModuleId[]
  /** Sound effects on/off. */
  muted: boolean
  /** Question ids the user got wrong and hasn't since corrected — the "Review" bucket. */
  mistakes: number[]
  /** Spaced-repetition schedule, keyed by question id. */
  srs: Record<number, SrsRecord>
  /** Per-day activity log, keyed by YYYY-MM-DD. */
  daily: Record<string, DayLog>
  /** Unlocked achievement ids. */
  achievements: string[]
  modules: Record<ModuleId, ModuleProgress>
}

/** A row in the global leaderboard. */
export interface LeaderRow {
  name: string
  xp: number
  /** true for the human player's row. */
  you: boolean
}
