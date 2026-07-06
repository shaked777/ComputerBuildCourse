import { AnimatePresence, motion } from 'framer-motion'
import { Swords, X, Timer, Link2, Flame, WifiOff } from 'lucide-react'
import type { Challenge } from '../lib/challengeApi'
import { isSupabaseConfigured } from '../lib/supabase'
import Button from './Button'

interface ChallengeModalProps {
  open: boolean
  /** A duel loaded from a ?challenge= link, waiting to be accepted. */
  pending: Challenge | null
  onClose: () => void
  onStartDuel: () => void
}

/** Friends modal: explain + create a duel, or accept one arriving via link. */
export default function ChallengeModal({ open, pending, onClose, onStartDuel }: ChallengeModalProps) {
  const accepting = pending !== null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-md rounded-t-3xl border border-white/60 p-6 shadow-pop sm:rounded-3xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#F97316] text-white shadow-pop">
                <Swords size={26} strokeWidth={2.2} />
              </span>
              <button
                onClick={onClose}
                aria-label="סגירה"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
              >
                <X size={22} />
              </button>
            </div>

            {!isSupabaseConfigured ? (
              <div className="text-center">
                <h2 className="font-display text-xl font-extrabold text-ink">דו־קרב חברים</h2>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-ink-soft">
                  <WifiOff size={15} /> דורש חיבור למסד הנתונים (ראו README)
                </p>
              </div>
            ) : accepting ? (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  ⚔️ <span dir="auto">{pending.challenger_name}</span> מאתגר אתכם!
                </h2>
                <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white/80 p-4">
                  <Flame size={22} className="text-orange-500" fill="#FB923C" strokeWidth={1.5} />
                  <span className="font-display text-lg font-bold text-ink">
                    התוצאה לניצחון:{' '}
                    <span className="text-2xl font-extrabold tabular-nums">{pending.challenger_score}</span>
                  </span>
                </div>
                <p className="mt-3 text-center text-sm text-ink-soft">
                  ריצת הישרדות אחת — 2 דקות, כל הבנק, ללא לבבות. תצליחו לעקוף?
                </p>
                <Button variant="primary" size="lg" onClick={onStartDuel} className="mt-5 w-full">
                  <Swords size={20} /> קבלו את האתגר
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink">אתגרו חבר לדו־קרב</h2>
                <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-soft">
                  <li className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-100 font-display font-extrabold text-orange-600">1</span>
                    <span className="flex items-center gap-1.5">
                      שחקו ריצת הישרדות <Timer size={14} className="text-ink-faint" /> (2 דקות)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-100 font-display font-extrabold text-orange-600">2</span>
                    <span className="flex items-center gap-1.5">
                      קבלו קישור אתגר <Link2 size={14} className="text-ink-faint" /> ושלחו לחבר
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-100 font-display font-extrabold text-orange-600">3</span>
                    <span>החבר משחק את אותה ריצה — מי שקולע יותר מנצח 🏆</span>
                  </li>
                </ul>
                <Button variant="primary" size="lg" onClick={onStartDuel} className="mt-5 w-full">
                  <Swords size={20} /> התחילו אתגר
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
