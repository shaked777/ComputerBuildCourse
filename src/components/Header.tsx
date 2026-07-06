import { useState } from 'react'
import { Zap, Cpu, Crown, Pencil, Check, Flame, BarChart3, Swords } from 'lucide-react'
import { useProgress } from '../state/progress'
import { streakDays } from '../lib/stats'
import { levelInfo } from '../lib/level'

interface HeaderProps {
  onOpenCrown: () => void
  onOpenStats: () => void
  onOpenFriends: () => void
  /** Shows a red dot on the friends icon (a duel is waiting). */
  hasPendingChallenge?: boolean
}

function ProfileChip() {
  const { state, setUsername } = useProgress()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(state.username)
  const lvl = levelInfo(state.xp)

  function commit() {
    setUsername(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-full border-2 border-correct bg-white px-2 py-1">
        <input
          autoFocus
          value={draft}
          maxLength={16}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(state.username)
              setEditing(false)
            }
          }}
          placeholder="שחקן 1"
          className="w-24 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink-faint"
          dir="auto"
        />
        <button onClick={commit} aria-label="שמירת שם" className="grid h-6 w-6 place-items-center rounded-full bg-correct text-white">
          <Check size={14} strokeWidth={3} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(state.username)
        setEditing(true)
      }}
      className="group flex min-w-0 items-center gap-2 rounded-full bg-paper px-2 py-1 transition hover:bg-black/5"
      title="שינוי שם המשתמש"
    >
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-display text-sm font-extrabold text-white">
        {state.username.charAt(0)}
        <span className="absolute -bottom-1 -left-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-ink px-0.5 text-[9px] font-extrabold text-white ring-2 ring-paper tabular-nums">
          {lvl.level}
        </span>
      </span>
      <span className="truncate text-sm font-bold text-ink" dir="auto">
        {state.username}
      </span>
      <Pencil size={13} className="shrink-0 text-ink-faint opacity-0 transition group-hover:opacity-100" />
    </button>
  )
}

export default function Header({
  onOpenCrown,
  onOpenStats,
  onOpenFriends,
  hasPendingChallenge = false,
}: HeaderProps) {
  const { state } = useProgress()
  const streak = streakDays(state.daily)

  return (
    <header className="sticky top-0 z-30 border-b border-line glass">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2.5 sm:px-6">
        <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white shadow-card sm:grid">
          <Cpu size={20} strokeWidth={2.4} />
        </span>

        <ProfileChip />

        <div className="mr-auto flex shrink-0 items-center gap-1.5">
          {streak > 0 && (
            <div className="hidden items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1.5 sm:flex" title="ימי רצף למידה">
              <Flame size={16} className="text-orange-500" fill="#FB923C" strokeWidth={1.5} />
              <span className="font-display text-sm font-extrabold text-ink tabular-nums">{streak}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-full bg-xp/15 px-2.5 py-1.5">
            <Zap size={17} fill="#FFC800" strokeWidth={0} />
            <span className="font-display text-sm font-extrabold text-ink tabular-nums">{state.xp}</span>
          </div>

          <button
            onClick={onOpenFriends}
            aria-label="אתגר חברים"
            title="אתגרו חבר לדו־קרב"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#E11D48] to-[#F97316] text-white shadow-pop transition hover:brightness-105"
          >
            <Swords size={17} strokeWidth={2.3} />
            {hasPendingChallenge && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-wrong ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={onOpenCrown}
            aria-label="דילוג שלבים"
            title="דילוג שלבים"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-orange-500 text-white shadow-pop transition hover:brightness-105"
          >
            <Crown size={18} fill="#FFFFFF" strokeWidth={2} />
          </button>

          <button
            onClick={onOpenStats}
            aria-label="סטטיסטיקות"
            title="סטטיסטיקות והגדרות"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
          >
            <BarChart3 size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </header>
  )
}
