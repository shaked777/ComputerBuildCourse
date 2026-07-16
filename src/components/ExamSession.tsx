import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Clock,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import type { ModuleId, SessionQuestion } from '../types'
import { MODULES } from '../data/modules'
import { useProgress } from '../state/progress'
import { moduleIdForTopic } from '../lib/questions'
import { buildExam } from '../lib/session'
import { playFanfare, playTap, playWrong } from '../lib/sound'
import OptionCard, { type OptionState } from './OptionCard'
import QuestionImage from './QuestionImage'
import Button from './Button'

const ACCENT = '#6366F1'
const EXAM_SIZE = 15
const EXAM_TIME_MS = 20 * 60_000

const HEB_MARKERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

function fmtTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

interface ExamSessionProps {
  onExit: () => void
}

interface ModuleScore {
  moduleId: ModuleId
  correct: number
  total: number
}

/** Full exam simulation: no feedback until submission, graded at the end. */
export default function ExamSession({ onExit }: ExamSessionProps) {
  const { state, answer, recordExam } = useProgress()

  const [questions, setQuestions] = useState<SessionQuestion[]>(() => buildExam(EXAM_SIZE))
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(EXAM_SIZE).fill(null))
  const [idx, setIdx] = useState(0)
  const [timeMs, setTimeMs] = useState(EXAM_TIME_MS)
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const submittedRef = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const total = questions.length
  const current = questions[idx]
  const answeredCount = answers.filter((a) => a != null).length

  function handleSubmit(force = false) {
    if (submittedRef.current) return
    const finalAnswers = answersRef.current
    if (!force) {
      const unanswered = finalAnswers.filter((a) => a == null).length
      if (unanswered > 0 && !window.confirm(`נותרו ${unanswered} שאלות ללא מענה. להגיש בכל זאת?`)) {
        return
      }
    }
    submittedRef.current = true

    let correct = 0
    questions.forEach((q, i) => {
      const ok = finalAnswers[i] === q.correct_answer
      if (ok) correct++
      // Feed the learning engine: XP, mastery, SRS and the review bucket.
      answer({ questionId: q.id, moduleId: moduleIdForTopic(q.topic), correct: ok })
    })
    const pct = Math.round((100 * correct) / questions.length)
    recordExam(pct)
    setCorrectCount(correct)
    setSubmitted(true)
    if (pct >= 60) playFanfare()
    else playWrong()
  }

  // Countdown; auto-submits when time runs out.
  useEffect(() => {
    if (submitted) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const dt = now - last
      last = now
      setTimeMs((t) => {
        const next = Math.max(0, t - dt)
        if (next <= 0) handleSubmit(true)
        return next
      })
    }, 500)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  function retake() {
    submittedRef.current = false
    setQuestions(buildExam(EXAM_SIZE))
    setAnswers(Array(EXAM_SIZE).fill(null))
    setIdx(0)
    setTimeMs(EXAM_TIME_MS)
    setCorrectCount(0)
    setSubmitted(false)
  }

  function confirmExit() {
    if (submitted || window.confirm('לצאת מהמבחן? ההתקדמות בו תאבד.')) onExit()
  }

  /* ------------------------------- results ------------------------------- */

  if (submitted) {
    const pct = Math.round((100 * correctCount) / total)
    const grade =
      pct >= 85
        ? { title: 'מצוין! מוכנים למבחן 🎓', color: '#58CC02' }
        : pct >= 60
          ? { title: 'עובר — יש עוד מה לחזק 💪', color: '#F59E0B' }
          : { title: 'צריך עוד תרגול — אל ייאוש!', color: '#FF4B4B' }

    const byModule = new Map<ModuleId, ModuleScore>()
    questions.forEach((q, i) => {
      const mid = moduleIdForTopic(q.topic)
      const row = byModule.get(mid) ?? { moduleId: mid, correct: 0, total: 0 }
      row.total++
      if (answers[i] === q.correct_answer) row.correct++
      byModule.set(mid, row)
    })
    const wrong = questions
      .map((q, i) => ({ q, given: answers[i] }))
      .filter(({ q, given }) => given !== q.correct_answer)

    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 grid h-32 w-32 place-items-center rounded-full"
            style={{ background: `${grade.color}1A`, boxShadow: `inset 0 0 0 8px ${grade.color}` }}
          >
            <span className="font-display text-4xl font-extrabold tabular-nums" style={{ color: grade.color }}>
              {pct}
            </span>
          </motion.div>
          <h2 className="font-display text-2xl font-extrabold text-ink">{grade.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {correctCount} מתוך {total} נכונות · הציון הטוב ביותר: {Math.max(state.examBest, pct)}
          </p>
        </div>

        {/* per-chapter breakdown */}
        <section className="mt-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
          <h3 className="mb-3 font-display text-lg font-extrabold text-ink">פירוט לפי פרקים</h3>
          <ul className="flex flex-col gap-3">
            {MODULES.filter((m) => byModule.has(m.id)).map((m) => {
              const row = byModule.get(m.id)!
              const p = Math.round((100 * row.correct) / row.total)
              return (
                <li key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-bold text-ink">
                      {m.chapter} · {m.title}
                    </span>
                    <span className="font-semibold text-ink-soft tabular-nums">
                      {row.correct}/{row.total}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-line">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* wrong answers review */}
        {wrong.length > 0 && (
          <section className="mt-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
            <h3 className="mb-3 font-display text-lg font-extrabold text-ink">
              שאלות לשיפור ({wrong.length}) — נוספו לתרגול נקודות התורפה
            </h3>
            <ul className="flex flex-col gap-4">
              {wrong.map(({ q, given }) => (
                <li key={q.id} className="rounded-2xl border border-wrong/25 bg-wrong-light/30 p-4">
                  <p dir="auto" className="font-bold leading-snug text-ink">
                    {q.question}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-wrong-text">
                    <XCircle size={15} />
                    <span dir="auto">{given ?? 'לא נענתה'}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-correct-text">
                    <Check size={15} strokeWidth={3} />
                    <span dir="auto">{q.correct_answer}</span>
                  </p>
                  <p dir="auto" className="mt-2 border-t border-wrong/15 pt-2 text-sm leading-relaxed text-ink-soft">
                    {q.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={retake} className="w-full">
            <RotateCcw size={19} /> מבחן חדש
          </Button>
          <Button variant="neutral" size="lg" onClick={onExit} className="w-full">
            חזרה למפה
          </Button>
        </div>
      </div>
    )
  }

  /* -------------------------------- active ------------------------------- */

  const lowTime = timeMs <= 2 * 60_000

  function optionState(opt: string): OptionState {
    return answers[idx] === opt ? 'selected' : 'idle'
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* HUD */}
      <header className="sticky top-0 z-20 border-b border-line glass">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={confirmExit}
            aria-label="יציאה"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
          >
            <X size={24} />
          </button>
          <motion.div
            animate={lowTime ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={lowTime ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-extrabold tabular-nums text-white ${
              lowTime ? 'bg-wrong' : 'bg-ink'
            }`}
          >
            <Clock size={16} strokeWidth={2.5} />
            {fmtTime(timeMs)}
          </motion.div>
          <span className="mr-auto text-sm font-bold text-ink-soft tabular-nums">
            {answeredCount}/{total} נענו
          </span>
        </div>
      </header>

      {/* Mode banner */}
      <div className="relative z-10 mx-auto mt-4 w-full max-w-2xl px-4 sm:px-6">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-card"
          style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)` }}
        >
          <GraduationCap size={18} strokeWidth={2.5} />
          <span className="font-display text-sm font-extrabold">מבחן מתכונת</span>
          <span className="opacity-70">·</span>
          <span className="text-sm font-semibold opacity-95">ללא משוב עד ההגשה</span>
        </div>
      </div>

      {/* Question navigator */}
      <nav className="mx-auto mt-3 w-full max-w-2xl px-4 sm:px-6" aria-label="ניווט שאלות">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_, i) => {
            const isCurrent = i === idx
            const isAnswered = answers[i] != null
            return (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`שאלה ${i + 1}`}
                className={[
                  'grid h-8 w-8 place-items-center rounded-lg text-xs font-extrabold transition tabular-nums',
                  isAnswered ? 'text-white' : 'bg-white text-ink-soft shadow-card',
                  isCurrent ? 'ring-2 ring-offset-1' : '',
                ].join(' ')}
                style={{
                  background: isAnswered ? ACCENT : undefined,
                  ['--tw-ring-color' as string]: ACCENT,
                }}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Question */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40 pt-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-pop sm:p-6"
          >
            <p className="mb-2 text-xs font-bold text-ink-faint tabular-nums">
              שאלה {idx + 1} מתוך {total}
            </p>
            <h1 dir="auto" className="mb-5 whitespace-pre-line font-display text-xl font-extrabold leading-snug text-ink sm:text-[23px]">
              {current.question}
            </h1>

            {current.image && <QuestionImage src={current.image} />}

            <div className="flex flex-col gap-3">
              {current.shuffledOptions.map((opt, i) => (
                <OptionCard
                  key={opt + i}
                  text={opt}
                  marker={HEB_MARKERS[i] ?? String(i + 1)}
                  state={optionState(opt)}
                  onClick={() => {
                    playTap()
                    setAnswers((prev) => {
                      const next = prev.slice()
                      next[idx] = opt
                      return next
                    })
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom bar: prev / submit / next */}
      <div className="glass sticky bottom-0 z-20 border-t border-line shadow-bar">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Button
            variant="neutral"
            size="md"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            <ChevronRight size={18} /> הקודמת
          </Button>
          <Button variant="primary" size="md" onClick={() => handleSubmit(false)} className="min-w-[120px]">
            <Send size={17} /> הגשה
          </Button>
          <Button
            variant="neutral"
            size="md"
            disabled={idx === total - 1}
            onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          >
            הבאה <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
