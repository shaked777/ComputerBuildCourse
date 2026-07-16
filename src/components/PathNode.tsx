import { motion } from 'framer-motion'
import { Lock, Check, Star, Clock } from 'lucide-react'
import type { ModuleDef, NodeStatus } from '../types'

interface PathNodeProps {
  def: ModuleDef
  status: NodeStatus
  /** 0..1 */
  mastery: number
  /** Stars earned in this chapter (0–3, one per passed part). */
  stars: number
  /** The next actionable node — gets a bouncing "START" bubble. */
  isCurrent: boolean
  onClick: () => void
}

export const NODE_SIZE = 88
const R = 40
const C = 2 * Math.PI * R

/**
 * A single roadmap node (one course chapter). Its layout box is exactly the
 * circle (NODE_SIZE²); the "START" bubble and the title label are absolutely
 * positioned so they never shift the node — letting the parent place nodes by
 * their center.
 */
export default function PathNode({ def, status, mastery, stars, isCurrent, onClick }: PathNodeProps) {
  const Icon = def.icon
  const locked = status === 'locked'
  const soon = status === 'soon'
  const completed = status === 'completed'
  const disabled = locked || soon
  const accent = def.accent

  return (
    <div className="relative" style={{ width: NODE_SIZE, height: NODE_SIZE }}>
      {/* START bubble (floats above) */}
      {isCurrent && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-1 font-display text-xs font-extrabold tracking-wide text-white shadow-pop"
        >
          התחילו
          <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-ink" />
        </motion.div>
      )}

      <motion.button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.06 }}
        whileTap={disabled ? undefined : { scale: 0.94 }}
        animate={isCurrent && !disabled ? { y: [0, -6, 0] } : { y: 0 }}
        transition={
          isCurrent && !disabled
            ? { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
            : { type: 'spring', stiffness: 400, damping: 22 }
        }
        className={[
          'relative grid h-full w-full place-items-center rounded-full no-tap',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
        aria-label={`${def.chapter}: ${def.title}`}
      >
        {/* pulsing halo behind the current node */}
        {isCurrent && !disabled && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: `${accent}33`, animation: 'haloPulse 2.2s ease-out infinite' }}
          />
        )}

        {/* mastery ring */}
        <svg className="absolute inset-0 -rotate-90" width={NODE_SIZE} height={NODE_SIZE} viewBox={`0 0 ${NODE_SIZE} ${NODE_SIZE}`}>
          <circle cx={NODE_SIZE / 2} cy={NODE_SIZE / 2} r={R} fill="none" stroke="#E7E9EF" strokeWidth={6} />
          {!disabled && (
            <circle
              cx={NODE_SIZE / 2}
              cy={NODE_SIZE / 2}
              r={R}
              fill="none"
              stroke={completed ? '#FFB100' : accent}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (completed ? 1 : mastery))}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          )}
        </svg>

        {/* inner disc */}
        <div
          className="grid place-items-center rounded-full shadow-node"
          style={{
            width: NODE_SIZE - 20,
            height: NODE_SIZE - 20,
            background: completed
              ? `linear-gradient(145deg, ${accent}, ${accent}B3)`
              : disabled
                ? '#EEF0F5'
                : '#FFFFFF',
            border: completed
              ? 'none'
              : soon
                ? `3px dashed ${accent}66`
                : locked
                  ? 'none'
                  : `3px solid ${accent}`,
          }}
        >
          {locked ? (
            <Lock size={30} className="text-ink-faint" strokeWidth={2.5} />
          ) : (
            <Icon
              size={34}
              strokeWidth={2.4}
              style={{ color: completed ? '#FFFFFF' : soon ? `${accent}99` : accent }}
            />
          )}
        </div>

        {/* status badge */}
        {completed && (
          <span className="absolute -bottom-0.5 -left-0.5 grid h-7 w-7 place-items-center rounded-full bg-gold text-white shadow-md">
            <Check size={16} strokeWidth={3.5} />
          </span>
        )}
        {soon && (
          <span className="absolute -bottom-0.5 -left-0.5 grid h-7 w-7 place-items-center rounded-full bg-white text-ink-faint shadow-md">
            <Clock size={15} strokeWidth={2.6} />
          </span>
        )}
      </motion.button>

      {/* label (floats below) */}
      <div className="pointer-events-none absolute left-1/2 top-full mt-1 w-[170px] -translate-x-1/2 text-center">
        {/* three part-stars */}
        {!disabled && (
          <div className="mb-0.5 flex items-center justify-center gap-0.5" aria-label={`${stars} מתוך 3 כוכבים`}>
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                size={13}
                className={i <= stars ? 'text-gold' : 'text-line'}
                fill={i <= stars ? '#FFB100' : '#E7E9EF'}
                strokeWidth={i <= stars ? 1 : 1.5}
              />
            ))}
          </div>
        )}
        <p className={`font-display text-[11px] font-bold ${disabled ? 'text-ink-faint' : ''}`} style={{ color: disabled ? undefined : accent }}>
          {def.chapter}
        </p>
        <p className={`font-display text-sm font-bold leading-tight ${disabled ? 'text-ink-faint' : 'text-ink'}`}>
          {def.title}
        </p>
        <p className="text-[11px] text-ink-faint">{soon ? 'בקרוב' : def.subtitle}</p>
      </div>
    </div>
  )
}
