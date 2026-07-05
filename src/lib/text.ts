/**
 * Heuristic: does this string look like a pure code / numeric token
 * (MIPS instruction, register, hex, binary, a number)? Such strings read
 * best in a monospace, left-to-right box even inside an RTL layout.
 */
export function looksLikeCode(text: string): boolean {
  const t = text.trim()
  if (!t) return false

  // Contains Hebrew letters → treat as prose (bidi-auto handles it).
  if (/[֐-׿]/.test(t)) return false

  // Registers ($t0), hex (0x..), MIPS-ish punctuation, or mostly digits.
  if (/\$[a-z]/i.test(t)) return true
  if (/0x[0-9a-f]+/i.test(t)) return true
  if (/^[-+]?[\d.,]+$/.test(t)) return true
  if (/[(){}\[\],]/.test(t) && /[a-z]/i.test(t)) return true

  // A short all-latin/symbol token (e.g. "lw", "NOP", "1.0101 x 2^4").
  if (/^[\x20-\x7E]+$/.test(t)) return true

  return false
}
