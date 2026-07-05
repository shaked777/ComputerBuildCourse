import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface ExplanationPanelProps {
  explanation: string
  correct: boolean
  /** The right answer, surfaced when the user was wrong. */
  correctAnswer?: string
}

/** The "why" panel — slides in beneath the question after the user checks. */
export default function ExplanationPanel({
  explanation,
  correct,
  correctAnswer,
}: ExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="overflow-hidden"
    >
      <div
        className={[
          'mt-5 rounded-2xl border p-4',
          correct ? 'border-correct/30 bg-correct-light/50' : 'border-wrong/30 bg-wrong-light/50',
        ].join(' ')}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <Lightbulb
            size={18}
            className={correct ? 'text-correct-text' : 'text-wrong-text'}
            strokeWidth={2.25}
          />
          <span
            className={[
              'font-display text-sm font-bold',
              correct ? 'text-correct-text' : 'text-wrong-text',
            ].join(' ')}
          >
            הסבר
          </span>
        </div>

        {!correct && correctAnswer && (
          <p className="mb-1 text-[15px] text-ink-soft">
            התשובה הנכונה:{' '}
            <span dir="auto" className="font-semibold text-wrong-text">
              {correctAnswer}
            </span>
          </p>
        )}

        <p dir="auto" className="text-[15px] leading-relaxed text-ink">
          {explanation}
        </p>
      </div>
    </motion.div>
  )
}
