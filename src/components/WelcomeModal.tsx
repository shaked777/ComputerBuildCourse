import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, ArrowLeft, Trophy } from 'lucide-react'
import { useProgress } from '../state/progress'
import Button from './Button'

/**
 * First-open onboarding: shown until the player picks a name.
 * Submitting an empty field falls back to the default ("שחקן 1").
 */
export default function WelcomeModal() {
  const { completeOnboarding } = useProgress()
  const [name, setName] = useState('')

  function start() {
    completeOnboarding(name)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 30, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-sm rounded-3xl border border-white/60 bg-white p-6 text-center shadow-pop"
      >
        <motion.span
          initial={{ rotate: -10, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink text-white shadow-pop"
        >
          <Cpu size={34} strokeWidth={2.2} />
        </motion.span>

        <h1 className="font-display text-2xl font-extrabold text-ink">
          ברוכים הבאים ל־Assembly Quest!
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          מבנה מחשבים ושפת סף · אפקה 10145
          <br />
          איך נקרא לכם על המסלול?
        </p>

        <input
          autoFocus
          value={name}
          maxLength={16}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
          placeholder="השם שלכם…"
          dir="auto"
          className="mt-5 w-full rounded-2xl border-2 border-line bg-paper px-4 py-3 text-center font-display text-lg font-bold text-ink outline-none transition focus:border-correct placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-faint"
        />
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-ink-faint">
          <Trophy size={12} className="text-gold" />
          השם יופיע בטבלת המובילים המשותפת — אפשר לשנות אותו בכל רגע
        </p>

        <Button variant="primary" size="lg" onClick={start} className="mt-5 w-full">
          יאללה, מתחילים!
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  )
}
