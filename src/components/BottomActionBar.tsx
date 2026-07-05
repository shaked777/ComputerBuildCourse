import { motion } from 'framer-motion'
import { Check, X, ArrowLeft } from 'lucide-react'
import Button from './Button'

export type QuizPhase = 'answering' | 'correct' | 'incorrect'

interface BottomActionBarProps {
  phase: QuizPhase
  canCheck: boolean
  isLast: boolean
  onCheck: () => void
  onContinue: () => void
  /** Hide the Check button (e.g. matching auto-evaluates) and show this hint while answering. */
  hideCheck?: boolean
  hint?: string
  /** Override the success heading (e.g. "+3 שניות" in Survival). */
  correctLabel?: string
}

/**
 * The Brilliant-style sticky bottom bar. Neutral while answering, turns green on
 * a correct answer and red (+ shake) on an incorrect one, then offers "Continue".
 */
export default function BottomActionBar({
  phase,
  canCheck,
  isLast,
  onCheck,
  onContinue,
  hideCheck = false,
  hint,
  correctLabel,
}: BottomActionBarProps) {
  const isCorrect = phase === 'correct'
  const isWrong = phase === 'incorrect'
  const settled = isCorrect || isWrong

  const tint = isCorrect
    ? 'bg-correct-light/80 border-correct/30'
    : isWrong
      ? 'bg-wrong-light/80 border-wrong/30'
      : 'glass border-line'

  return (
    <motion.div
      animate={isWrong ? { x: [0, -9, 9, -7, 7, 0] } : { x: 0 }}
      transition={isWrong ? { duration: 0.45 } : { duration: 0.2 }}
      className={`sticky bottom-0 z-20 border-t shadow-bar ${tint}`}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-h-[44px] flex-1 items-center">
          {isCorrect && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="flex items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-correct text-white shadow-pop">
                <Check size={26} strokeWidth={3} />
              </span>
              <div className="leading-tight">
                <p className="font-display text-lg font-extrabold text-correct-text">{correctLabel ?? 'מצוין! 🎉'}</p>
                <p className="text-sm text-correct-text/80">תשובה נכונה</p>
              </div>
            </motion.div>
          )}

          {isWrong && (
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-wrong text-white shadow-pop">
                <X size={26} strokeWidth={3} />
              </span>
              <div className="leading-tight">
                <p className="font-display text-lg font-extrabold text-wrong-text">לא נורא</p>
                <p className="text-sm text-wrong-text/80">קראו את ההסבר 👇</p>
              </div>
            </div>
          )}

          {!settled && hideCheck && hint && (
            <p className="font-display text-sm font-bold text-ink-soft">{hint}</p>
          )}
        </div>

        {!settled ? (
          hideCheck ? null : (
            <Button variant="primary" size="lg" disabled={!canCheck} onClick={onCheck} className="min-w-[148px]">
              בדיקה
            </Button>
          )
        ) : (
          <Button
            variant={isCorrect ? 'primary' : 'danger'}
            size="lg"
            onClick={onContinue}
            className="min-w-[148px]"
          >
            {isLast ? 'סיום' : 'המשך'}
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
