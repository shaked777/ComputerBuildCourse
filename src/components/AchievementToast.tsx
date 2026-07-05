import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '../state/progress'
import { achievementById, type AchievementDef } from '../data/achievements'
import { playFanfare } from '../lib/sound'

const TOAST_MS = 4000

/** Global toast that pops whenever a new achievement unlocks. */
export default function AchievementToast() {
  const { state } = useProgress()
  const [toast, setToast] = useState<AchievementDef | null>(null)
  const prevCount = useRef(state.achievements.length)

  useEffect(() => {
    if (state.achievements.length > prevCount.current) {
      const latest = achievementById(state.achievements[state.achievements.length - 1])
      if (latest) {
        setToast(latest)
        playFanfare()
        const id = window.setTimeout(() => setToast(null), TOAST_MS)
        prevCount.current = state.achievements.length
        return () => window.clearTimeout(id)
      }
    }
    prevCount.current = state.achievements.length
  }, [state.achievements])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="flex items-center gap-3 rounded-2xl border-2 border-gold/50 bg-white/95 px-4 py-3 shadow-pop backdrop-blur"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-orange-500 text-white shadow-md">
              <toast.icon size={22} />
            </span>
            <span>
              <span className="block text-[11px] font-bold text-gold">הישג חדש! 🏅</span>
              <span className="block font-display font-extrabold leading-tight text-ink">{toast.title}</span>
              <span className="block text-xs text-ink-soft">{toast.desc}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
