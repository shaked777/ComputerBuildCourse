import { Dumbbell, ChevronLeft, Timer, Flame, GraduationCap, TrendingUp, CalendarClock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ModuleId } from '../types'
import { MODULES } from '../data/modules'
import { useProgress, moduleMastery, moduleStatus } from '../state/progress'
import { moduleQuestionCount } from '../lib/questions'
import { dueReviewIds } from '../lib/session'
import { levelInfo } from '../lib/level'
import PathNode, { NODE_SIZE } from './PathNode'
import Leaderboard from './Leaderboard'

interface LearningPathProps {
  onStartModule: (id: ModuleId) => void
  onReview: () => void
  onSurvival: () => void
  onExam: () => void
  onDailyReview: () => void
}

// Path geometry (px).
const W = 360
const TOP = 74
const GAP = 190
const AMP = 84
const CENTER = W / 2
const LABEL_SPACE = 80

const nodeX = (i: number) => CENTER + Math.sin(i * 1.08) * AMP
const nodeY = (i: number) => TOP + i * GAP

export default function LearningPath({
  onStartModule,
  onReview,
  onSurvival,
  onExam,
  onDailyReview,
}: LearningPathProps) {
  const { state } = useProgress()
  // Recomputed on every state change → the card count updates live.
  const dueCount = dueReviewIds(state.srs).length

  const statuses = MODULES.map((m) => moduleStatus(state, m.id))
  // "Current" = first startable, not-yet-completed chapter.
  const currentIndex = statuses.findIndex((s) => s === 'available' || s === 'in-progress')

  // Stats only count chapters that actually have questions.
  const contentModules = MODULES.filter((m) => moduleQuestionCount(m.id) > 0)
  const completedCount = contentModules.filter((m) => moduleStatus(state, m.id) === 'completed').length
  const overallMastery =
    contentModules.reduce((sum, m) => sum + moduleMastery(state, m.id), 0) / contentModules.length
  const lvl = levelInfo(state.xp)

  const svgHeight = nodeY(MODULES.length - 1) + NODE_SIZE / 2 + LABEL_SPACE
  const points = MODULES.map((_, i) => ({ x: nodeX(i), y: nodeY(i) }))

  const segments = points.slice(0, -1).map((p, i) => {
    const n = points[i + 1]
    const my = (p.y + n.y) / 2
    return {
      d: `M ${p.x} ${p.y} C ${p.x} ${my}, ${n.x} ${my}, ${n.x} ${n.y}`,
      done: statuses[i] === 'completed',
    }
  })

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6">
      {/* Hero */}
      <section className="mb-5 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card">
        <p className="font-display text-sm font-bold text-correct-text">מבנה מחשבים ושפת סף · 10145</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          שלום, <span dir="auto">{state.username}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {completedCount} מתוך {contentModules.length} פרקים פעילים הושלמו
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-correct"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(overallMastery * 100)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>

        {/* Level progress */}
        <div className="mt-4 flex items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 font-display text-sm font-extrabold text-ink">
            <TrendingUp size={16} className="text-brand-500" />
            רמה {lvl.level}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(lvl.progress * 100)}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-ink-faint tabular-nums">
            {lvl.into}/{lvl.need}
          </span>
        </div>
      </section>

      {/* Daily smart review (spaced repetition) */}
      {dueCount > 0 && (
        <button
          onClick={onDailyReview}
          className="group mb-3 flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-l from-[#0D9488] to-[#14B8A6] p-4 text-right shadow-pop transition active:translate-y-0.5"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white">
            <CalendarClock size={26} strokeWidth={2.2} />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white">חזרות להיום</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white/90">
                שינון מרווח
              </span>
            </span>
            <span className="block text-sm text-white/70">השאלות שהגיע זמנן — לחיזוק הזיכרון</span>
          </span>
          <span className="grid h-10 min-w-[40px] shrink-0 place-items-center rounded-xl bg-white px-2 font-display text-lg font-extrabold text-[#0D9488] tabular-nums">
            {dueCount}
          </span>
        </button>
      )}

      {/* Endless Survival mode */}
      <button
        onClick={onSurvival}
        className="group mb-3 flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-ink p-4 text-right shadow-pop transition active:translate-y-0.5"
      >
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-wrong text-white">
          <Timer size={26} strokeWidth={2.4} />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white">מצב הישרדות</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white/90">2:00 ⏱</span>
          </span>
          <span className="block text-sm text-white/60">טיימר 2 דקות · כל הבנק · ללא לבבות</span>
        </span>
        <span className="flex shrink-0 flex-col items-center rounded-xl bg-white/10 px-3 py-1.5">
          <span className="flex items-center gap-1">
            <Flame size={14} className="text-orange-400" fill="#FB923C" strokeWidth={1.5} />
            <span className="font-display text-lg font-extrabold text-white tabular-nums">{state.survivalBest}</span>
          </span>
          <span className="text-[10px] font-semibold text-white/50">שיא</span>
        </span>
      </button>

      {/* Exam simulation */}
      <button
        onClick={onExam}
        className="group mb-3 flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-l from-[#6366F1] to-[#8B5CF6] p-4 text-right shadow-pop transition active:translate-y-0.5"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white">
          <GraduationCap size={26} strokeWidth={2.2} />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white">מבחן מתכונת</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white/90">15 שאלות · 20 דק׳</span>
          </span>
          <span className="block text-sm text-white/70">ללא משוב עד ההגשה · ציון ופירוט לפי פרקים</span>
        </span>
        <span className="flex shrink-0 flex-col items-center rounded-xl bg-white/10 px-3 py-1.5">
          <span className="font-display text-lg font-extrabold text-white tabular-nums">
            {state.examBest > 0 ? state.examBest : '—'}
          </span>
          <span className="text-[10px] font-semibold text-white/60">ציון שיא</span>
        </span>
      </button>

      {/* Practice weaknesses */}
      {state.mistakes.length > 0 && (
        <button
          onClick={onReview}
          className="mb-3 flex w-full items-center gap-4 rounded-2xl border-2 border-wrong/30 bg-wrong-light/40 p-4 text-right transition hover:bg-wrong-light/70"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-wrong text-white shadow-pop">
            <Dumbbell size={24} />
          </span>
          <span className="flex-1">
            <span className="block font-display font-extrabold text-ink">תרגול נקודות תורפה</span>
            <span className="block text-sm text-ink-soft">{state.mistakes.length} שאלות ממתינות לחזרה</span>
          </span>
          <ChevronLeft className="text-wrong" />
        </button>
      )}

      {/* Global leaderboard */}
      <div className="mt-3">
        <Leaderboard username={state.username} xp={state.xp} />
      </div>

      {/* The winding chapter path */}
      <div className="relative mx-auto" style={{ width: W, height: svgHeight }}>
        <svg
          className="absolute inset-0"
          width={W}
          height={svgHeight}
          viewBox={`0 0 ${W} ${svgHeight}`}
          fill="none"
          aria-hidden
        >
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              stroke={seg.done ? '#FFD466' : '#E7E9EF'}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={seg.done ? undefined : '2 16'}
            />
          ))}
        </svg>

        {MODULES.map((def, i) => (
          <div
            key={def.id}
            className="absolute"
            style={{ left: nodeX(i) - NODE_SIZE / 2, top: nodeY(i) - NODE_SIZE / 2 }}
          >
            <PathNode
              def={def}
              status={statuses[i]}
              mastery={moduleMastery(state, def.id)}
              isCurrent={i === currentIndex}
              onClick={() => onStartModule(def.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
