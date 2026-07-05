import { motion } from 'framer-motion'
import {
  ArrowRight,
  Flame,
  Target,
  TrendingUp,
  ListChecks,
  Volume2,
  VolumeX,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { MODULES } from '../data/modules'
import { ACHIEVEMENTS } from '../data/achievements'
import { useProgress, moduleMastery } from '../state/progress'
import { moduleQuestionCount } from '../lib/questions'
import { streakDays, lastNDays } from '../lib/stats'
import { levelInfo } from '../lib/level'

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

interface StatsViewProps {
  onBack: () => void
  onReset: () => void
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}1A`, color }}>
        {icon}
      </div>
      <div className="font-display text-2xl font-extrabold text-ink tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-ink-soft">{label}</div>
    </div>
  )
}

/** Personal statistics: streak, level, accuracy, mastery, weekly activity, achievements. */
export default function StatsView({ onBack, onReset }: StatsViewProps) {
  const { state, toggleMute } = useProgress()

  const streak = streakDays(state.daily)
  const lvl = levelInfo(state.xp)
  const accuracy = state.totalAnswered > 0 ? Math.round((100 * state.totalCorrect) / state.totalAnswered) : 0
  const week = lastNDays(state.daily, 7)
  const weekMax = Math.max(1, ...week.map((d) => d.xp))
  const contentModules = MODULES.filter((m) => moduleQuestionCount(m.id) > 0)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 font-display text-sm font-bold text-ink-soft transition hover:text-ink"
      >
        <ArrowRight size={18} /> חזרה למפה
      </button>

      <h1 className="mb-4 font-display text-2xl font-extrabold text-ink">
        הסטטיסטיקות של <span dir="auto">{state.username}</span>
      </h1>

      {/* Top cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={19} fill="currentColor" strokeWidth={1.5} />}
          label="ימי רצף למידה"
          value={`${streak}`}
          color="#F97316"
        />
        <StatCard icon={<TrendingUp size={19} />} label={`רמה · ${lvl.into}/${lvl.need} XP`} value={`${lvl.level}`} color="#3B6FE0" />
        <StatCard icon={<Target size={19} />} label="אחוז דיוק כולל" value={`${accuracy}%`} color="#58CC02" />
        <StatCard icon={<ListChecks size={19} />} label="שאלות נענו" value={`${state.totalAnswered}`} color="#8B5CF6" />
      </div>

      {/* Weekly activity */}
      <section className="mb-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">פעילות השבוע</h2>
        <div className="flex h-28 items-end justify-between gap-2">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                className="w-full max-w-[34px] rounded-t-lg"
                style={{ background: d.xp > 0 ? '#58CC02' : '#E7E9EF' }}
                initial={{ height: 4 }}
                animate={{ height: Math.max(4, Math.round((d.xp / weekMax) * 88)) }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                title={`${d.xp} XP`}
              />
              <span className="text-[11px] font-semibold text-ink-faint">{WEEKDAYS[d.weekday]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter mastery */}
      <section className="mb-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">שליטה בפרקים</h2>
        <ul className="flex flex-col gap-3.5">
          {contentModules.map((m) => {
            const mastery = moduleMastery(state, m.id)
            const done = state.modules[m.id]?.masteredIds.length ?? 0
            const total = moduleQuestionCount(m.id)
            return (
              <li key={m.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold text-ink">
                    {m.chapter} · {m.title}
                  </span>
                  <span className="font-semibold text-ink-soft tabular-nums">
                    {Math.min(done, total)}/{total}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(mastery * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Achievements */}
      <section className="mb-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-1 font-display text-lg font-extrabold text-ink">הישגים</h2>
        <p className="mb-4 text-xs text-ink-faint">
          {state.achievements.length} מתוך {ACHIEVEMENTS.length} נפתחו
        </p>
        <ul className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = state.achievements.includes(a.id)
            const Icon = a.icon
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  unlocked ? 'border-gold/40 bg-gold/10' : 'border-line bg-paper opacity-60'
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    unlocked ? 'bg-gold text-white' : 'bg-line text-ink-faint'
                  }`}
                >
                  {unlocked ? <Icon size={20} /> : <Lock size={17} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-extrabold text-ink">{a.title}</span>
                  <span className="block text-[11px] leading-tight text-ink-soft">{a.desc}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Settings */}
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-3 font-display text-lg font-extrabold text-ink">הגדרות</h2>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={toggleMute}
            className="flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3 transition hover:bg-black/5"
          >
            <span className="flex items-center gap-2.5 font-bold text-ink">
              {state.muted ? <VolumeX size={19} className="text-ink-faint" /> : <Volume2 size={19} className="text-correct" />}
              צלילי משוב
            </span>
            <span className={`text-sm font-bold ${state.muted ? 'text-ink-faint' : 'text-correct-text'}`}>
              {state.muted ? 'כבוי' : 'פעיל'}
            </span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 rounded-2xl border border-wrong/30 bg-wrong-light/30 px-4 py-3 font-bold text-wrong-text transition hover:bg-wrong-light/60"
          >
            <RotateCcw size={18} /> איפוס כל ההתקדמות
          </button>
        </div>
      </section>
    </div>
  )
}
