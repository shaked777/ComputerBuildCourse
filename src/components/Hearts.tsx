import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Infinity as InfinityIcon } from 'lucide-react'
import { SESSION_HEARTS } from '../data/modules'

interface HeartsProps {
  count: number
  max?: number
  /** God Mode: show a heart + ∞ instead of a finite row. */
  infinite?: boolean
}

/** Row of hearts; a heart "pops" out when lost. */
export default function Hearts({ count, max = SESSION_HEARTS, infinite }: HeartsProps) {
  if (infinite) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1" aria-label="לבבות אינסופיים">
        <Heart className="text-heart" fill="#FF4B4B" size={22} strokeWidth={0} />
        <InfinityIcon size={20} className="text-gold" strokeWidth={3} />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5" aria-label={`${count} לבבות נותרו`}>
      {Array.from({ length: max }).map((_, i) => {
        const alive = i < count
        return (
          <AnimatePresence mode="popLayout" key={i}>
            <motion.span
              key={alive ? 'on' : 'off'}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <Heart
                className={alive ? 'text-heart' : 'text-line'}
                fill={alive ? '#FF4B4B' : '#E7E9EF'}
                size={26}
                strokeWidth={alive ? 0 : 2}
              />
            </motion.span>
          </AnimatePresence>
        )
      })}
    </div>
  )
}
