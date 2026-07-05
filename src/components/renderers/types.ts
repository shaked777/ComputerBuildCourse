import type { SessionQuestion } from '../../types'
import type { QuizPhase } from '../BottomActionBar'

/** Shared contract every interactive question renderer implements. */
export interface RendererProps {
  question: SessionQuestion
  phase: QuizPhase
  accent: string
  /** Increments when the user presses "Check"; renderers evaluate on change. */
  checkNonce: number
  /** Report whether a checkable answer is ready (enables the Check button). */
  onReadyChange: (ready: boolean) => void
  /** Report correctness (on Check, or auto for matching). */
  onResult: (correct: boolean) => void
}

export function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
