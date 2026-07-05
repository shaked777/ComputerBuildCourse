import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { shuffle } from '../../lib/session'
import { looksLikeCode } from '../../lib/text'
import { playTap, playWrong } from '../../lib/sound'
import type { RendererProps } from './types'

/** Interactive Matching Pairs: tap a term then its definition to link them. */
export default function MatchingRenderer({ question, accent, onReadyChange, onResult }: RendererProps) {
  const pairs = useMemo(() => question.pairs ?? [], [question])
  const termToMatch = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of pairs) m[p.term] = p.match
    return m
  }, [pairs])

  const [terms] = useState(() => shuffle(pairs.map((p) => p.term)))
  const [defs] = useState(() => shuffle(pairs.map((p) => p.match)))
  const [matched, setMatched] = useState<string[]>([]) // matched terms
  const [selTerm, setSelTerm] = useState<string | null>(null)
  const [selDef, setSelDef] = useState<string | null>(null)
  const [wrong, setWrong] = useState<{ term: string; def: string } | null>(null)
  const reported = useRef(false)

  useEffect(() => onReadyChange(false), [onReadyChange])

  // Evaluate once both a term and a definition are selected.
  useEffect(() => {
    if (!selTerm || !selDef) return
    if (termToMatch[selTerm] === selDef) {
      playTap()
      setMatched((m) => [...m, selTerm])
      setSelTerm(null)
      setSelDef(null)
    } else {
      playWrong()
      setWrong({ term: selTerm, def: selDef })
      const id = setTimeout(() => {
        setWrong(null)
        setSelTerm(null)
        setSelDef(null)
      }, 550)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selTerm, selDef])

  // All pairs linked → report success once.
  useEffect(() => {
    if (!reported.current && matched.length === pairs.length && pairs.length > 0) {
      reported.current = true
      onResult(true)
    }
  }, [matched, pairs.length, onResult])

  const matchedDefs = matched.map((t) => termToMatch[t])

  const cellBase =
    'flex min-h-[58px] items-center justify-center rounded-2xl border-2 p-3 text-center font-semibold transition-colors duration-200'

  function cellTone(isTerm: boolean, value: string): string {
    const isMatched = isTerm ? matched.includes(value) : matchedDefs.includes(value)
    const isSel = isTerm ? selTerm === value : selDef === value
    const isWrong = wrong && (isTerm ? wrong.term === value : wrong.def === value)
    if (isMatched) return 'border-correct bg-correct-light text-correct-text'
    if (isWrong) return 'border-wrong bg-wrong-light text-wrong-text animate-shake'
    if (isSel) return 'text-white shadow-pop'
    return 'border-line bg-white text-ink hover:border-ink/25'
  }

  function Cell({ value, isTerm }: { value: string; isTerm: boolean }) {
    const isMatched = isTerm ? matched.includes(value) : matchedDefs.includes(value)
    const isSel = isTerm ? selTerm === value : selDef === value
    const code = looksLikeCode(value)
    return (
      <motion.button
        layout
        disabled={isMatched}
        onClick={() => {
          if (isMatched) return
          playTap()
          if (isTerm) setSelTerm(value)
          else setSelDef(value)
        }}
        whileTap={{ scale: 0.96 }}
        className={`${cellBase} ${cellTone(isTerm, value)} ${code ? 'font-mono text-sm' : 'text-[15px]'}`}
        style={{
          background: isSel ? accent : undefined,
          borderColor: isSel ? accent : undefined,
        }}
      >
        <span dir="auto" className="flex items-center gap-1.5">
          {isMatched && <Check size={15} strokeWidth={3} />}
          {value}
        </span>
      </motion.button>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {terms.map((t) => (
            <Cell key={t} value={t} isTerm />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {defs.map((d) => (
            <Cell key={d} value={d} isTerm={false} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-faint">
        {matched.length}/{pairs.length} זוגות הותאמו · הקישו מונח ואז את ההגדרה שלו
      </p>
    </div>
  )
}
