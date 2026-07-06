import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Swords,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Trophy,
  Frown,
  Scale,
  Loader2,
  AlertTriangle,
  Home,
} from 'lucide-react'
import type { Challenge } from '../lib/challengeApi'
import { createChallenge, submitOpponentResult, challengeUrl } from '../lib/challengeApi'
import { playFanfare, playWrong } from '../lib/sound'
import Button from './Button'

type ShareState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'error' }

interface DuelResultProps {
  /** create → I opened a duel; accept → I answered someone's link. */
  mode: 'create' | 'accept'
  myName: string
  myScore: number
  /** The rival's challenge row (accept mode only). */
  challenge?: Challenge
  onHome: () => void
}

function ShareBox({ url, myScore }: { url: string; myScore: number }) {
  const [copied, setCopied] = useState(false)
  const message = `⚔️ אני מאתגר/ת אותך ב-Assembly Quest! קלעתי ${myScore} במצב הישרדות — נראה אותך: ${url}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the visible input allows manual copy */
    }
  }

  return (
    <div className="mt-5 w-full rounded-2xl border-2 border-line bg-white/85 p-4 text-right">
      <p className="mb-2 font-display text-sm font-extrabold text-ink">שלחו את הקישור לחבר:</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          dir="ltr"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 font-mono text-xs text-ink-soft outline-none"
        />
        <button
          onClick={copy}
          aria-label="העתקת קישור"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition ${
            copied ? 'bg-correct' : 'bg-ink hover:opacity-90'
          }`}
        >
          {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={17} />}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 font-bold text-white transition hover:brightness-105"
        >
          <MessageCircle size={18} /> וואטסאפ
        </a>
        {typeof navigator.share === 'function' && (
          <button
            onClick={() => navigator.share({ text: message }).catch(() => undefined)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 font-bold text-white transition hover:brightness-105"
          >
            <Share2 size={17} /> שיתוף
          </button>
        )}
      </div>
    </div>
  )
}

/** Post-run screen for survival duels: share a new duel, or the verdict vs. a rival. */
export default function DuelResult({ mode, myName, myScore, challenge, onHome }: DuelResultProps) {
  const [share, setShare] = useState<ShareState>({ status: 'idle' })
  const ranOnce = useRef(false)

  // create-mode: publish the duel immediately. accept-mode: record my result.
  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true
    if (mode === 'create') {
      setShare({ status: 'loading' })
      void createChallenge(myName, myScore).then((id) =>
        setShare(id ? { status: 'ready', url: challengeUrl(id) } : { status: 'error' }),
      )
    } else if (challenge) {
      void submitOpponentResult(challenge.id, myName, myScore)
    }
  }, [mode, myName, myScore, challenge])

  const rivalScore = challenge?.challenger_score ?? 0
  const verdict = mode === 'accept' ? (myScore > rivalScore ? 'win' : myScore < rivalScore ? 'lose' : 'tie') : null

  useEffect(() => {
    if (verdict === 'win') playFanfare()
    else if (verdict === 'lose') playWrong()
  }, [verdict])

  // Counter-challenge from the accept screen.
  function counterChallenge() {
    setShare({ status: 'loading' })
    void createChallenge(myName, myScore).then((id) =>
      setShare(id ? { status: 'ready', url: challengeUrl(id) } : { status: 'error' }),
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <motion.span
        initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 15 }}
        className={`mb-5 grid h-24 w-24 place-items-center rounded-full shadow-pop ${
          verdict === 'win'
            ? 'bg-correct-light'
            : verdict === 'lose'
              ? 'bg-wrong-light'
              : 'bg-gradient-to-br from-[#E11D48]/15 to-[#F97316]/15'
        }`}
      >
        {verdict === 'win' ? (
          <Trophy size={48} className="text-gold" fill="#FFB100" strokeWidth={1.5} />
        ) : verdict === 'lose' ? (
          <Frown size={48} className="text-wrong" strokeWidth={1.8} />
        ) : verdict === 'tie' ? (
          <Scale size={48} className="text-ink-soft" strokeWidth={1.8} />
        ) : (
          <Swords size={46} className="text-[#E11D48]" strokeWidth={1.9} />
        )}
      </motion.span>

      {mode === 'create' ? (
        <>
          <h2 className="font-display text-3xl font-extrabold text-ink">האתגר מוכן! ⚔️</h2>
          <p className="mt-2 text-ink-soft">
            קלעתם <span className="font-display text-xl font-extrabold text-ink tabular-nums">{myScore}</span> — עכשיו
            תורם של החברים לנסות.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-3xl font-extrabold text-ink">
            {verdict === 'win' ? 'ניצחתם! 🏆' : verdict === 'lose' ? 'הפעם הם לקחו…' : 'תיקו מושלם!'}
          </h2>
          <div className="mt-5 flex w-full items-stretch justify-center gap-3">
            <div className={`flex-1 rounded-2xl border-2 p-3 ${verdict !== 'lose' ? 'border-correct bg-correct-light/50' : 'border-line bg-white/80'}`}>
              <p className="truncate text-xs font-bold text-ink-soft" dir="auto">{myName} (אתם)</p>
              <p className="font-display text-3xl font-extrabold text-ink tabular-nums">{myScore}</p>
            </div>
            <span className="self-center font-display text-lg font-extrabold text-ink-faint">VS</span>
            <div className={`flex-1 rounded-2xl border-2 p-3 ${verdict === 'lose' ? 'border-wrong bg-wrong-light/50' : 'border-line bg-white/80'}`}>
              <p className="truncate text-xs font-bold text-ink-soft" dir="auto">{challenge?.challenger_name}</p>
              <p className="font-display text-3xl font-extrabold text-ink tabular-nums">{rivalScore}</p>
            </div>
          </div>
        </>
      )}

      {share.status === 'loading' && (
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> יוצרים קישור אתגר…
        </p>
      )}
      {share.status === 'error' && (
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-wrong-text">
          <AlertTriangle size={16} /> יצירת האתגר נכשלה — בדקו חיבור ונסו שוב
        </p>
      )}
      {share.status === 'ready' && <ShareBox url={share.url} myScore={myScore} />}

      <div className="mt-7 flex w-full flex-col gap-3">
        {mode === 'accept' && share.status === 'idle' && (
          <Button variant="primary" size="lg" onClick={counterChallenge} className="w-full">
            <Swords size={19} /> אתגרו בחזרה עם התוצאה שלכם
          </Button>
        )}
        <Button variant={mode === 'create' || share.status !== 'idle' ? 'primary' : 'neutral'} size="lg" onClick={onHome} className="w-full">
          <Home size={19} /> חזרה למפה
        </Button>
      </div>
    </div>
  )
}
