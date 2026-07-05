import { motion } from 'framer-motion'

interface ProgressBarProps {
  /** 0..1 */
  value: number
  className?: string
}

/** Smooth, animated progress bar used at the top of a quiz session. */
export default function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-line ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <motion.div
        className="h-full rounded-full bg-correct"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      >
        {/* glossy highlight */}
        <div className="mx-1 mt-1 h-1 rounded-full bg-white/40" />
      </motion.div>
    </div>
  )
}
