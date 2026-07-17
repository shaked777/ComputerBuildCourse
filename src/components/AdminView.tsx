import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Users,
  Activity,
  ListChecks,
  Swords,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { fetchAdminData, sha256Hex, type AdminData } from '../lib/adminApi'
import Button from './Button'

const SESSION_KEY = 'aq:admin-ok'

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 2) return 'עכשיו'
  if (mins < 60) return `לפני ${mins} דק׳`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שע׳`
  return `לפני ${Math.floor(hours / 24)} ימים`
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-1 text-brand-500">{icon}</div>
      <div className="font-display text-2xl font-extrabold text-ink tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-ink-soft">{label}</div>
    </div>
  )
}

/** Super-user dashboard (reached via ?admin, gated by a hashed passcode). */
export default function AdminView({ onBack }: { onBack: () => void }) {
  const configured = Boolean(import.meta.env.VITE_ADMIN_CODE_HASH)
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)

  async function tryLogin() {
    const hash = await sha256Hex(code.trim())
    if (hash === import.meta.env.VITE_ADMIN_CODE_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  async function load() {
    setLoading(true)
    setData(await fetchAdminData())
    setLoading(false)
  }

  useEffect(() => {
    if (authed) void load()
  }, [authed])

  if (!configured || !authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink text-white shadow-pop">
          <Lock size={30} />
        </span>
        <h1 className="font-display text-2xl font-extrabold text-ink">אזור מנהל</h1>
        {!configured ? (
          <p className="mt-2 text-sm text-ink-soft">לא הוגדר קוד מנהל (VITE_ADMIN_CODE_HASH).</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-soft">הזינו את קוד המנהל כדי להמשיך.</p>
            <input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void tryLogin()}
              placeholder="קוד מנהל…"
              dir="ltr"
              className={`mt-5 w-full rounded-2xl border-2 bg-white px-4 py-3 text-center font-mono text-lg outline-none transition ${
                error ? 'border-wrong animate-shake' : 'border-line focus:border-correct'
              }`}
            />
            {error && <p className="mt-2 text-sm font-bold text-wrong-text">קוד שגוי</p>}
            <Button variant="primary" size="lg" onClick={() => void tryLogin()} className="mt-4 w-full">
              כניסה
            </Button>
          </>
        )}
        <button onClick={onBack} className="mt-4 text-sm font-bold text-ink-soft underline">
          חזרה לאפליקציה
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-5 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white shadow-pop">
          <ShieldCheck size={22} />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-ink">לוח מנהל</h1>
          <p className="text-xs text-ink-faint">נתונים חיים ממסד הנתונים</p>
        </div>
        <button
          onClick={() => void load()}
          aria-label="רענון"
          className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-black/5"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-sm font-bold text-ink-soft transition hover:bg-black/5"
        >
          <ArrowRight size={16} /> חזרה
        </button>
      </div>

      {loading && !data && (
        <p className="flex items-center gap-2 py-10 text-ink-soft">
          <Loader2 size={18} className="animate-spin" /> טוען נתונים…
        </p>
      )}

      {!loading && !data && (
        <p className="py-10 text-center text-ink-soft">לא ניתן לטעון נתונים — בדקו את החיבור למסד.</p>
      )}

      {data && (
        <>
          {/* aggregates */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<Users size={19} />} label="שחקנים סה״כ" value={`${data.totals.players}`} />
            <StatCard icon={<Activity size={19} />} label="פעילים היום / השבוע" value={`${data.totals.activeToday} / ${data.totals.active7d}`} />
            <StatCard icon={<ListChecks size={19} />} label="תשובות סה״כ" value={`${data.totals.answered.toLocaleString()}`} />
            <StatCard icon={<Swords size={19} />} label="דו־קרבות (הושלמו)" value={`${data.totals.duelsCreated} (${data.totals.duelsFinished})`} />
          </div>

          {/* players table */}
          <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-xs text-ink-soft">
                  <th className="px-4 py-3 font-bold">שחקן</th>
                  <th className="px-3 py-3 font-bold">XP</th>
                  <th className="px-3 py-3 font-bold">רמה</th>
                  <th className="px-3 py-3 font-bold">⭐</th>
                  <th className="px-3 py-3 font-bold">תשובות</th>
                  <th className="px-3 py-3 font-bold">דיוק</th>
                  <th className="px-3 py-3 font-bold">רצף</th>
                  <th className="px-3 py-3 font-bold">מבחן</th>
                  <th className="px-3 py-3 font-bold">הישרדות</th>
                  <th className="px-3 py-3 font-bold">נראה לאחרונה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.players.map((p) => {
                  const activeNow =
                    p.lastSeen && Date.now() - new Date(p.lastSeen).getTime() < 5 * 60 * 1000
                  return (
                    <tr key={p.playerId} className={activeNow ? 'bg-correct-light/30' : ''}>
                      <td className="px-4 py-2.5 font-bold text-ink" dir="auto">
                        {activeNow && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-correct" />}
                        {p.name}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{p.xp}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.level}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.stars}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.answered}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.answered > 0 ? `${p.accuracy}%` : '—'}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.streak}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.examBest > 0 ? p.examBest : '—'}</td>
                      <td className="px-3 py-2.5 tabular-nums">{p.survivalBest > 0 ? p.survivalBest : '—'}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{timeAgo(p.lastSeen)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            שורה ירוקה = פעיל ב-5 הדקות האחרונות. שחקן ללא פרופיל ענן מציג נתוני לוח בלבד.
          </p>
        </>
      )}
    </div>
  )
}
