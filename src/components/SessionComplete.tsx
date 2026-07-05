import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, HeartCrack, Star, Target, Zap, Flame, TrendingUp } from 'lucide-react'
import type { QuizMode } from '../types'
import { useProgress } from '../state/progress'
import { levelInfo } from '../lib/level'
import { playFanfare, playWrong } from '../lib/sound'
import Button from './Button'

interface SessionCompleteProps {
  mode: QuizMode
  passed: boolean
  perfect: boolean
  correctCount: number
  total: number
  xpEarned: number
  survivalBest?: number
  isRecord?: boolean
  bestStreak?: number
  onRetry: () => void
  onExit: () => void
}

const CONFETTI = [
  '#58CC02', '#FFC800', '#3B6FE0', '#EC4899', '#06B6D4', '#8B5CF6',
  '#F97316', '#10B981', '#6366F1', '#FF4B4B', '#FFB100', '#A855F7',
]

/** Animated 0→target counter (requestAnimationFrame, ~0.9s). */
function useCountUp(target: number, ms = 900): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target <= 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3)))) // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return value
}

function Stat({
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
    <div className="flex-1 rounded-2xl border-2 bg-white/80 p-3 text-center" style={{ borderColor: color + '55' }}>
      <div className="mb-1 flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="font-display text-xl font-extrabold text-ink tabular-nums">{value}</div>
      <div className="text-xs text-ink-soft">{label}</div>
    </div>
  )
}

export default function SessionComplete({
  mode,
  passed,
  perfect,
  correctCount,
  total,
  xpEarned,
  survivalBest = 0,
  isRecord = false,
  bestStreak = 0,
  onRetry,
  onExit,
}: SessionCompleteProps) {
  const { state } = useProgress()
  const survival = mode === 'survival'
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const celebrate = survival ? isRecord : passed
  const shownXp = useCountUp(xpEarned)
  const lvl = levelInfo(state.xp)

  useEffect(() => {
    if (celebrate) playFanfare()
    else if (!passed && !survival) playWrong()
  }, [celebrate, passed, survival])

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      {celebrate &&
        CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute top-8 h-2.5 w-2.5"
            style={{
              background: c,
              left: `${5 + (i * 7.6) % 90}%`,
              borderRadius: i % 3 === 0 ? '9999px' : '2px',
            }}
            initial={{ y: -30, opacity: 0, rotate: 0, x: 0 }}
            animate={{
              y: [-30, 260],
              x: [0, (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 9)],
              opacity: [0, 1, 0],
              rotate: i % 2 === 0 ? 420 : -380,
            }}
            transition={{ duration: 2 + (i % 3) * 0.3, delay: i * 0.06, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        className={[
          'mb-6 grid h-28 w-28 place-items-center rounded-full shadow-pop',
          celebrate ? 'bg-correct-light' : survival ? 'bg-orange-100' : 'bg-wrong-light',
        ].join(' ')}
      >
        {survival ? (
          isRecord ? (
            <Flame size={56} className="text-orange-500" fill="#FB923C" strokeWidth={1.5} />
          ) : (
            <Flame size={56} className="text-orange-400" strokeWidth={1.8} />
          )
        ) : passed ? (
          <Trophy size={56} className="text-gold" fill="#FFB100" strokeWidth={1.5} />
        ) : (
          <HeartCrack size={56} className="text-wrong" strokeWidth={1.8} />
        )}
      </motion.div>

      <h2 className="font-display text-3xl font-extrabold text-ink">
        {survival
          ? isRecord
            ? 'שיא חדש! 🔥'
            : 'הזמן נגמר! ⏱'
          : perfect
            ? 'מושלם! ללא טעויות'
            : passed
              ? 'כל הכבוד!'
              : 'נגמרו הלבבות'}
      </h2>
      <p className="mt-2 mb-6 text-ink-soft">
        {survival
          ? `${correctCount} תשובות נכונות · רצף שיא ${bestStreak} 🔥`
          : passed
            ? 'סיימתם את התרגול בהצלחה.'
            : 'נסו שוב — הפעם תצליחו 💪'}
      </p>

      <div className="mb-5 flex w-full gap-3">
        <Stat icon={<Zap size={22} fill="#FFC800" strokeWidth={0} />} label="XP" value={`+${shownXp}`} color="#FFB100" />
        {survival ? (
          <>
            <Stat icon={<Star size={22} fill="#58CC02" strokeWidth={0} />} label="ניקוד" value={`${correctCount}`} color="#58CC02" />
            <Stat icon={<Flame size={22} fill="#FB923C" strokeWidth={0} />} label="שיא" value={`${survivalBest}`} color="#FB923C" />
          </>
        ) : (
          <>
            <Stat icon={<Target size={22} />} label="דיוק" value={`${accuracy}%`} color="#3B6FE0" />
            <Stat icon={<Star size={22} fill="#58CC02" strokeWidth={0} />} label="נכונות" value={`${correctCount}/${total}`} color="#58CC02" />
          </>
        )}
      </div>

      {/* Level progress */}
      <div className="mb-8 w-full rounded-2xl border border-line bg-white/80 p-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-display font-extrabold text-ink">
            <TrendingUp size={16} className="text-brand-500" /> רמה {lvl.level}
          </span>
          <span className="font-semibold text-ink-soft tabular-nums">
            {lvl.into}/{lvl.need} XP לרמה הבאה
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(lvl.progress * 100)}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button variant="primary" size="lg" onClick={onRetry} className="w-full">
          {survival ? 'שחקו שוב' : 'תרגול נוסף'}
        </Button>
        <Button variant="neutral" size="lg" onClick={onExit} className="w-full">
          חזרה למפה
        </Button>
      </div>
    </div>
  )
}
