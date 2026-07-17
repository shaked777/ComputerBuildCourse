import { AnimatePresence, motion } from 'framer-motion'
import { X, Star, Play, Sprout, Dumbbell, GraduationCap } from 'lucide-react'
import type { ModuleDef, QuestionLevel } from '../types'
import { LEVELS } from '../data/modules'
import { moduleQuestionCount } from '../lib/questions'
import { useProgress } from '../state/progress'

const LEVEL_ICONS = { 1: Sprout, 2: Dumbbell, 3: GraduationCap } as const

interface ChapterModalProps {
  def: ModuleDef | null
  onClose: () => void
  onStartLevel: (level: QuestionLevel) => void
}

/**
 * Level picker for a chapter: three parts (יסודות / תרגול / רמת מבחן), each
 * awarding a star when passed. One star is enough to unlock the next chapter.
 */
export default function ChapterModal({ def, onClose, onStartLevel }: ChapterModalProps) {
  const { state } = useProgress()

  return (
    <AnimatePresence>
      {def && (
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
            className="glass w-full max-w-md rounded-t-3xl border border-white/60 p-5 shadow-pop sm:rounded-3xl"
          >
            {/* header */}
            <div className="mb-4 flex items-start gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-pop"
                style={{ background: def.accent }}
              >
                <def.icon size={24} strokeWidth={2.3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold" style={{ color: def.accent }}>
                  {def.chapter}
                </p>
                <h2 className="truncate font-display text-xl font-extrabold leading-tight text-ink">
                  {def.title}
                </h2>
                <p className="text-xs text-ink-faint">{def.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="סגירה"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
              >
                <X size={22} />
              </button>
            </div>

            <p className="mb-3 text-sm text-ink-soft">
              שלושה חלקים — כל חלק שעוברים מעניק ⭐. כוכב אחד מספיק לפתיחת הפרק הבא!
            </p>

            {/* the three parts */}
            <ul className="flex flex-col gap-2.5">
              {LEVELS.map(({ level, label, desc }) => {
                const LevelIcon = LEVEL_ICONS[level]
                const earned = state.modules[def.id]?.starLevels?.includes(level) ?? false
                const empty = moduleQuestionCount(def.id, level) === 0
                return (
                  <li key={level}>
                    <button
                      disabled={empty}
                      onClick={() => onStartLevel(level)}
                      aria-label={`חלק ${level}: ${label}`}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-right transition ${
                        empty
                          ? 'cursor-not-allowed border-line bg-paper opacity-50'
                          : earned
                            ? 'border-gold/50 bg-gold/10 hover:bg-gold/20'
                            : 'border-line bg-white/80 hover:border-ink/20 hover:shadow-card'
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          earned ? 'bg-gold text-white' : 'text-white'
                        }`}
                        style={earned ? undefined : { background: def.accent }}
                      >
                        <LevelIcon size={20} strokeWidth={2.3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-display font-extrabold text-ink">
                            חלק {level} · {label}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-ink-soft">{desc}</span>
                      </span>
                      <span className="shrink-0">
                        {earned ? (
                          <Star size={22} className="text-gold" fill="#FFB100" strokeWidth={1.5} />
                        ) : (
                          <span
                            className="grid h-9 w-9 place-items-center rounded-full text-white"
                            style={{ background: empty ? '#C7CBD6' : def.accent }}
                          >
                            <Play size={16} fill="currentColor" strokeWidth={0} />
                          </span>
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
