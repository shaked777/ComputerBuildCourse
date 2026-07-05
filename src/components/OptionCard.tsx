import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { looksLikeCode } from '../lib/text'

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted'

interface OptionCardProps {
  text: string
  /** Hebrew letter marker: א / ב / ג / ד */
  marker: string
  state: OptionState
  disabled?: boolean
  onClick?: () => void
}

const SHELL: Record<OptionState, string> = {
  idle: 'bg-surface border-line hover:border-brand-200 hover:bg-brand-50/40',
  selected: 'bg-brand-50 border-brand-500 ring-2 ring-brand-200',
  correct: 'bg-correct-light border-correct ring-2 ring-correct/30',
  wrong: 'bg-wrong-light border-wrong ring-2 ring-wrong/30',
  muted: 'bg-surface border-line opacity-55',
}

const MARKER: Record<OptionState, string> = {
  idle: 'bg-paper text-ink-soft border-line',
  selected: 'bg-brand-500 text-white border-brand-500',
  correct: 'bg-correct text-white border-correct',
  wrong: 'bg-wrong text-white border-wrong',
  muted: 'bg-paper text-ink-faint border-line',
}

export default function OptionCard({
  text,
  marker,
  state,
  disabled,
  onClick,
}: OptionCardProps) {
  const code = looksLikeCode(text)

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={[
        'group flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-right',
        'transition-colors duration-150 no-tap',
        disabled ? 'cursor-default' : 'cursor-pointer',
        SHELL[state],
      ].join(' ')}
    >
      <span
        className={[
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 font-display text-base font-bold',
          MARKER[state],
        ].join(' ')}
      >
        {state === 'correct' ? (
          <Check size={20} strokeWidth={3} />
        ) : state === 'wrong' ? (
          <X size={20} strokeWidth={3} />
        ) : (
          marker
        )}
      </span>

      <span
        dir={code ? 'ltr' : 'auto'}
        className={[
          'flex-1 leading-snug',
          code ? 'font-mono text-[15px] text-left' : 'text-[17px] font-medium',
          state === 'correct'
            ? 'text-correct-text'
            : state === 'wrong'
              ? 'text-wrong-text'
              : 'text-ink',
        ].join(' ')}
      >
        {text}
      </span>
    </motion.button>
  )
}
