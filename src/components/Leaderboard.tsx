import { motion } from 'framer-motion'
import { Trophy, Crown, Medal } from 'lucide-react'
import { buildLeaderboard } from '../data/leaderboard'

interface LeaderboardProps {
  username: string
  xp: number
}

const RANK_STYLES = [
  { ring: '#FFB100', bg: 'bg-gold/15', icon: <Crown size={16} className="text-gold" fill="#FFB100" strokeWidth={1.5} /> },
  { ring: '#9CA3AF', bg: 'bg-ink-faint/15', icon: <Medal size={16} className="text-ink-soft" /> },
  { ring: '#CD7F32', bg: 'bg-orange-200/40', icon: <Medal size={16} className="text-orange-500" /> },
]

export default function Leaderboard({ username, xp }: LeaderboardProps) {
  const rows = buildLeaderboard(username, xp)

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line bg-gradient-to-l from-gold/10 to-transparent px-5 py-3.5">
        <Trophy size={20} className="text-gold" fill="#FFB100" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-extrabold text-ink">טבלת המובילים</h2>
        <span className="mr-auto text-xs font-semibold text-ink-faint">לפי XP</span>
      </div>

      <ul className="divide-y divide-line/70">
        {rows.map((row, i) => {
          const rank = i + 1
          const style = RANK_STYLES[i]
          return (
            <motion.li
              key={row.name + (row.you ? '-you' : '')}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`flex items-center gap-3 px-5 py-3 ${row.you ? 'bg-correct-light/40' : ''}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                  style ? style.bg : 'bg-paper'
                } text-ink`}
                style={style ? { boxShadow: `inset 0 0 0 2px ${style.ring}` } : undefined}
              >
                {style ? style.icon : rank}
              </span>

              <span className="flex-1 truncate font-display font-bold text-ink" dir="auto">
                {row.name}
                {row.you && (
                  <span className="mr-2 rounded-full bg-correct px-2 py-0.5 align-middle text-[10px] font-bold text-white">
                    אתה
                  </span>
                )}
              </span>

              <span className="flex shrink-0 items-center gap-1 font-display font-extrabold text-ink tabular-nums">
                {row.xp}
                <span className="text-xs font-semibold text-xp">XP</span>
              </span>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
