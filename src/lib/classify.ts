import type { Question, QuestionKind } from '../types'

const VALUE_TOKEN = /^\s*(0x[0-9a-fA-F]+|0b[01]+|[01]{3,}|[-+]?\d{1,5}(\.\d+)?)\s*$/

/**
 * Does every option look like a short numeric / hex / binary value?
 * Such questions render as an inline "fill-in-the-blank" dropdown
 * (base conversions, cache bit-widths, Amdahl speedups, …).
 */
function looksFill(q: Question): boolean {
  if (q.options.length === 0) return false
  return q.options.every((o) => VALUE_TOKEN.test(o) && o.trim().length <= 8)
}

/**
 * The quiz engine's adapter: choose how a question is rendered.
 * Explicit `kind` / `pairs` / `sequence` win; otherwise we auto-detect
 * fill-in-the-blank from the option patterns, defaulting to multiple choice.
 */
export function classifyQuestion(q: Question): QuestionKind {
  if (q.kind) return q.kind
  if (q.pairs && q.pairs.length > 0) return 'matching'
  if (q.sequence && q.sequence.length > 0) return 'arrange'
  if (looksFill(q)) return 'fill'
  return 'choice'
}
