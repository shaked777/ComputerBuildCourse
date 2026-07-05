import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { looksLikeCode } from '../../lib/text'
import { playTap } from '../../lib/sound'
import { arraysEqual, type RendererProps } from './types'

/** Tap-to-Arrange: place the tokens in the correct chronological order. */
export default function ArrangeRenderer({
  question,
  phase,
  accent,
  checkNonce,
  onReadyChange,
  onResult,
}: RendererProps) {
  const sequence = useMemo(() => question.sequence ?? [], [question])
  const tokens = useMemo(() => question.shuffledOptions, [question])
  const [answer, setAnswer] = useState<string[]>([])
  const settled = phase !== 'answering'

  const ready = answer.length === sequence.length
  useEffect(() => onReadyChange(ready), [ready, onReadyChange])
  useEffect(() => {
    if (checkNonce > 0) onResult(arraysEqual(answer, sequence))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkNonce])

  const pool = tokens.filter((t) => !answer.includes(t))

  const chipClass = (text: string) =>
    `rounded-xl border-2 px-3.5 py-2.5 font-semibold leading-snug transition ${
      looksLikeCode(text) ? 'font-mono text-sm' : 'text-[15px]'
    }`

  return (
    <div className="flex flex-col gap-4">
      {/* Answer row */}
      <div className="min-h-[112px] rounded-2xl border-2 border-dashed border-line bg-surface/60 p-3 backdrop-blur-sm">
        {answer.length === 0 ? (
          <p className="grid h-[88px] place-items-center text-sm text-ink-faint">
            הקישו על הבלוקים מטה לפי הסדר הנכון
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {answer.map((t, i) => {
              const ok = t === sequence[i]
              const tone = settled
                ? ok
                  ? 'border-correct bg-correct-light text-correct-text'
                  : 'border-wrong bg-wrong-light text-wrong-text'
                : 'border-transparent bg-white text-ink shadow-card'
              return (
                <motion.button
                  layout
                  key={t}
                  disabled={settled}
                  onClick={() => setAnswer((a) => a.filter((x) => x !== t))}
                  className={`${chipClass(t)} ${tone}`}
                >
                  <span className="ml-1.5 text-xs opacity-50">{i + 1}.</span>
                  <span dir="auto">{t}</span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Pool */}
      <div className="flex flex-wrap gap-2">
        {pool.map((t) => (
          <motion.button
            layout
            key={t}
            disabled={settled}
            onClick={() => {
              playTap()
              setAnswer((a) => [...a, t])
            }}
            whileTap={{ scale: 0.94 }}
            className={`${chipClass(t)} border-line bg-white text-ink shadow-card`}
            style={{ borderColor: answer.includes(t) ? undefined : `${accent}55` }}
          >
            <span dir="auto">{t}</span>
          </motion.button>
        ))}
        {pool.length === 0 && <span className="py-2 text-sm text-ink-faint">כל הבלוקים סודרו ✓</span>}
      </div>

      {settled && !arraysEqual(answer, sequence) && (
        <p className="text-sm text-ink-soft">
          הסדר הנכון:{' '}
          <span dir="auto" className="font-semibold text-correct-text">
            {sequence.join('  →  ')}
          </span>
        </p>
      )}
    </div>
  )
}
