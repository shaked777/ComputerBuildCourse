import { AnimatePresence, motion } from 'framer-motion'
import { Crown, X, Lock, Check, ArrowLeft, Clock } from 'lucide-react'
import type { ModuleId } from '../types'
import { MODULES } from '../data/modules'
import { useProgress, moduleStatus } from '../state/progress'
import { moduleQuestionCount } from '../lib/questions'

interface CrownModalProps {
  open: boolean
  onClose: () => void
  onJump: (id: ModuleId) => void
}

/** Premium "skip stages" modal — jump directly to any chapter, ignoring prerequisites. */
export default function CrownModal({ open, onClose, onJump }: CrownModalProps) {
  const { state } = useProgress()

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
            className="glass max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/60 p-5 shadow-pop sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold to-orange-500 text-white shadow-pop">
                <Crown size={24} fill="#FFFFFF" strokeWidth={2} />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl font-extrabold text-ink">דילוג שלבים</h2>
                <p className="text-sm text-ink-soft">קפצו לכל פרק — גם אם עדיין נעול</p>
              </div>
              <button
                onClick={onClose}
                aria-label="סגירה"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
              >
                <X size={22} />
              </button>
            </div>

            <ul className="flex flex-col gap-2">
              {MODULES.map((def) => {
                const status = moduleStatus(state, def.id)
                const soon = moduleQuestionCount(def.id) === 0
                const Icon = def.icon
                return (
                  <li key={def.id}>
                    <button
                      disabled={soon}
                      onClick={() => {
                        if (soon) return
                        onJump(def.id)
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 border-line bg-white/80 p-3 text-right transition ${
                        soon ? 'cursor-not-allowed opacity-55' : 'hover:border-ink/20 hover:shadow-card'
                      }`}
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                        style={{ background: def.accent }}
                      >
                        <Icon size={22} strokeWidth={2.4} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[11px] font-bold" style={{ color: def.accent }}>
                          {def.chapter}
                        </span>
                        <span className="block font-display font-extrabold leading-tight text-ink">{def.title}</span>
                        <span className="block text-xs text-ink-faint">{def.subtitle}</span>
                      </span>
                      <span className="shrink-0">
                        {soon ? (
                          <Clock size={18} className="text-ink-faint" />
                        ) : status === 'completed' ? (
                          <Check size={20} className="text-correct" strokeWidth={3} />
                        ) : status === 'locked' ? (
                          <Lock size={18} className="text-gold" />
                        ) : (
                          <ArrowLeft size={20} style={{ color: def.accent }} strokeWidth={2.5} />
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
