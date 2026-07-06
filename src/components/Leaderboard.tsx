import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, MoreHorizontal } from 'lucide-react'
import { buildLeaderboard } from '../data/leaderboard'
import { isSupabaseConfigured } from '../lib/supabase'
import { submitScore, fetchLeaderboard, type LeaderboardResult } from '../lib/leaderboardApi'

interface LeaderboardProps {
  username: string
  xp: number
}

interface DisplayRow {
  key: string
  name: string
  xp: number
  you: boolean
  rank: number
}

const RANK_STYLES = [
  { ring: '#FFB100', bg: 'bg-gold/15', icon: <Crown size={16} className="text-gold" fill="#FFB100" strokeWidth={1.5} /> },
  { ring: '#9CA3AF', bg: 'bg-ink-faint/15', icon: <Medal size={16} className="text-ink-soft" /> },
  { ring: '#CD7F32', bg: 'bg-orange-200/40', icon: <Medal size={16} className="text-orange-500" /> },
]

export default function Leaderboard({ username, xp }: LeaderboardProps) {
  const [remote, setRemote] = useState<LeaderboardResult | null>(null)
  const [live, setLive] = useState(false)
  const debounce = useRef<number | undefined>(undefined)

  // Publish our score and pull the live board (debounced), when configured.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    window.clearTimeout(debounce.current)
    debounce.current = window.setTimeout(async () => {
      await submitScore(username, xp)
      const res = await fetchLeaderboard(xp, 10)
      if (res) {
        setRemote(res)
        setLive(true)
      } else {
        setLive(false)
      }
    }, 400)
    return () => window.clearTimeout(debounce.current)
  }, [username, xp])

  const rows: DisplayRow[] = useMemo(() => {
    if (live && remote) {
      const top: DisplayRow[] = remote.rows.map((r, i) => ({
        key: r.player_id,
        name: r.name,
        xp: r.xp,
        you: r.player_id === remote.playerId,
        rank: i + 1,
      }))
      // If the player is outside the top N, append their real-rank row.
      if (!top.some((r) => r.you)) {
        top.push({ key: `you-${remote.playerId}`, name: username, xp, you: true, rank: remote.myRank })
      }
      return top
    }
    return buildLeaderboard(username, xp).map((r, i) => ({
      key: r.name + (r.you ? '-you' : ''),
      name: r.name,
      xp: r.xp,
      you: r.you,
      rank: i + 1,
    }))
  }, [live, remote, username, xp])

  const status = !isSupabaseConfigured
    ? { label: 'הדגמה', dot: '#9CA3AF' }
    : live
      ? { label: 'חי', dot: '#58CC02' }
      : { label: 'מקומי', dot: '#9CA3AF' }

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line bg-gradient-to-l from-gold/10 to-transparent px-5 py-3.5">
        <Trophy size={20} className="text-gold" fill="#FFB100" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-extrabold text-ink">טבלת המובילים</h2>
        <span className="mr-auto flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-ink-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
          {status.label}
        </span>
      </div>

      <ul className="divide-y divide-line/70">
        {rows.map((row, i) => {
          const gap = i > 0 && row.rank > rows[i - 1].rank + 1
          const style = RANK_STYLES[row.rank - 1]
          return (
            <div key={row.key}>
              {gap && (
                <li className="flex justify-center py-1.5 text-ink-faint">
                  <MoreHorizontal size={18} />
                </li>
              )}
              <motion.li
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
                  {style ? style.icon : row.rank}
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
            </div>
          )
        })}
      </ul>
    </section>
  )
}
