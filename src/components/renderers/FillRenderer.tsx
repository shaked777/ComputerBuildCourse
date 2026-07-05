import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Check, X } from 'lucide-react'
import { playTap } from '../../lib/sound'
import type { RendererProps } from './types'

/** Fill-in-the-blank: an inline dropdown "token" the user fills with a value. */
export default function FillRenderer({
  question,
  phase,
  accent,
  checkNonce,
  onReadyChange,
  onResult,
}: RendererProps) {
  const [value, setValue] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const settled = phase !== 'answering'
  const correct = phase === 'correct'

  useEffect(() => onReadyChange(value != null), [value, onReadyChange])
  useEffect(() => {
    if (checkNonce > 0) onResult(value === question.correct_answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkNonce])

  const slotBorder = settled ? (correct ? '#58CC02' : '#FF4B4B') : value ? accent : '#E7E9EF'
  const slotBg = settled ? (correct ? '#E4FFCE' : '#FFE2E2') : value ? `${accent}14` : '#FFFFFF'

  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-surface/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-center gap-3 text-lg">
        <span className="font-semibold text-ink-soft">התשובה:</span>

        <div className="relative">
          <button
            type="button"
            disabled={settled}
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-[120px] items-center justify-between gap-2 rounded-xl border-2 px-4 py-2.5 font-mono text-[17px] font-bold transition"
            style={{ borderColor: slotBorder, background: slotBg, direction: 'ltr' }}
          >
            <span className={value ? 'text-ink' : 'text-ink-faint'}>{value ?? '? ? ?'}</span>
            {settled ? (
              correct ? (
                <Check size={18} className="text-correct" strokeWidth={3} />
              ) : (
                <X size={18} className="text-wrong" strokeWidth={3} />
              )
            ) : (
              <ChevronDown size={18} className="text-ink-faint" />
            )}
          </button>

          <AnimatePresence>
            {open && !settled && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                className="absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 flex-col gap-1.5 rounded-2xl border border-line bg-white p-2 shadow-pop"
              >
                {question.shuffledOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      playTap()
                      setValue(opt)
                      setOpen(false)
                    }}
                    className="rounded-xl px-5 py-2 text-center font-mono text-[17px] font-bold text-ink transition hover:bg-paper"
                    style={{ direction: 'ltr' }}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {settled && !correct && (
        <p className="mt-3 text-center text-sm text-ink-soft">
          הערך הנכון:{' '}
          <span className="font-mono font-bold text-correct-text" style={{ direction: 'ltr', display: 'inline-block' }}>
            {question.correct_answer}
          </span>
        </p>
      )}
    </div>
  )
}
