import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Flame, Clock, Route, Dumbbell } from 'lucide-react'
import type { ModuleId, QuizMode, SessionQuestion, ThemeKey } from '../types'
import { useProgress } from '../state/progress'
import { moduleIdForTopic } from '../lib/questions'
import { MODULES, SESSION_HEARTS, XP_PER_CORRECT, XP_CLEAR_BONUS, XP_PERFECT_BONUS } from '../data/modules'
import { classifyQuestion } from '../lib/classify'
import { playCorrect, playWrong } from '../lib/sound'
import ProgressBar from './ProgressBar'
import Hearts from './Hearts'
import ExplanationPanel from './ExplanationPanel'
import BottomActionBar, { type QuizPhase } from './BottomActionBar'
import SessionComplete from './SessionComplete'
import QuestionImage from './QuestionImage'
import QuestionRenderer, { questionKindLabel } from './renderers/QuestionRenderer'
import ChapterBackground from './ChapterBackground'

const SURVIVAL_TIME_MS = 120_000
const TIME_BONUS_MS = 3_000

interface QuizSessionProps {
  makeQuestions: () => SessionQuestion[]
  title: string
  accent: string
  theme: ThemeKey
  mode: QuizMode
  moduleId?: ModuleId
  survivalBest?: number
  onSurvivalEnd?: (score: number) => void
  onExit: () => void
}

type Status = 'active' | 'result'

function chapterLabelForTopic(topic: string): string {
  const def = MODULES.find((m) => m.id === moduleIdForTopic(topic))
  return def ? `${def.chapter} · ${def.title}` : topic
}

function fmtTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function QuizSession({
  makeQuestions,
  title,
  accent,
  theme,
  mode,
  moduleId,
  survivalBest = 0,
  onSurvivalEnd,
  onExit,
}: QuizSessionProps) {
  const { answer, completeSession } = useProgress()
  const survival = mode === 'survival'

  const [questions, setQuestions] = useState<SessionQuestion[]>(makeQuestions)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<QuizPhase>('answering')
  const [status, setStatus] = useState<Status>('active')
  const [ready, setReady] = useState(false)
  const [checkNonce, setCheckNonce] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [hearts, setHearts] = useState(SESSION_HEARTS)
  const [timeMs, setTimeMs] = useState(SURVIVAL_TIME_MS)
  const [paused, setPaused] = useState(false)
  const [bestAtStart] = useState(survivalBest)

  // Refs mirror state for use inside intervals / callbacks without stale closures.
  const phaseRef = useRef(phase)
  const indexRef = useRef(index)
  const questionsRef = useRef(questions)
  const statusRef = useRef(status)
  const heartsRef = useRef(hearts)
  const correctRef = useRef(correctCount)
  phaseRef.current = phase
  indexRef.current = index
  questionsRef.current = questions
  statusRef.current = status
  heartsRef.current = hearts
  correctRef.current = correctCount

  const total = questions.length
  const current = questions[index]
  const settled = phase !== 'answering'
  const isLast = !survival && index === total - 1
  const kind = current ? classifyQuestion(current) : 'choice'
  const isMatching = kind === 'matching'

  useEffect(() => setBestStreak((b) => Math.max(b, streak)), [streak])

  const finish = useCallback(() => {
    if (statusRef.current !== 'active') return
    if (survival) onSurvivalEnd?.(correctRef.current)
    else if (moduleId && heartsRef.current > 0)
      completeSession({ moduleId, passed: true, perfect: wrongCount === 0 })
    setStatus('result')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survival, moduleId, onSurvivalEnd, completeSession, wrongCount])

  // Survival countdown timer (paused while reading an explanation).
  useEffect(() => {
    if (!survival || status !== 'active' || paused) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const dt = now - last
      last = now
      setTimeMs((t) => Math.max(0, t - dt))
    }, 200)
    return () => window.clearInterval(id)
  }, [survival, status, paused])

  useEffect(() => {
    if (survival && status === 'active' && timeMs <= 0) finish()
  }, [timeMs, survival, status, finish])

  const onReadyChange = useCallback((r: boolean) => setReady(r), [])

  const settle = useCallback(
    (correct: boolean) => {
      if (phaseRef.current !== 'answering') return
      const q = questionsRef.current[indexRef.current]
      const resolved = moduleId ?? moduleIdForTopic(q.topic)
      answer({ questionId: q.id, moduleId: resolved, correct })
      if (correct) {
        setCorrectCount((c) => c + 1)
        setStreak((s) => s + 1)
        if (survival) setTimeMs((t) => t + TIME_BONUS_MS)
        playCorrect()
        setPhase('correct')
      } else {
        setWrongCount((w) => w + 1)
        setStreak(0)
        if (survival) setPaused(true)
        else setHearts((h) => Math.max(0, h - 1))
        playWrong()
        setPhase('incorrect')
      }
    },
    [survival, moduleId, answer],
  )

  function handleCheck() {
    if (!ready || phase !== 'answering') return
    setCheckNonce((n) => n + 1)
  }

  function advance() {
    const ni = indexRef.current + 1
    if (survival && ni + 3 >= questionsRef.current.length) {
      setQuestions((prev) => [...prev, ...makeQuestions()])
    }
    setIndex(ni)
    setPhase('answering')
    setReady(false)
    setCheckNonce(0)
  }

  function handleContinue() {
    if (survival) {
      setPaused(false)
      advance()
      return
    }
    if (heartsRef.current <= 0 || isLast) {
      finish()
      return
    }
    advance()
  }

  function retry() {
    setQuestions(makeQuestions())
    setIndex(0)
    setPhase('answering')
    setReady(false)
    setCheckNonce(0)
    setCorrectCount(0)
    setWrongCount(0)
    setStreak(0)
    setBestStreak(0)
    setHearts(SESSION_HEARTS)
    setTimeMs(SURVIVAL_TIME_MS)
    setPaused(false)
    setStatus('active')
  }

  if (total === 0 || !current) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg text-ink-soft">אין כרגע שאלות לתרגול כאן.</p>
        <button onClick={onExit} className="font-bold text-correct-text underline">
          חזרה למפה
        </button>
      </div>
    )
  }

  if (status === 'result') {
    const xpEarned =
      correctCount * XP_PER_CORRECT +
      (!survival && hearts > 0 ? XP_CLEAR_BONUS + (wrongCount === 0 ? XP_PERFECT_BONUS : 0) : 0)
    return (
      <>
        <ChapterBackground theme={theme} accent={accent} />
        <SessionComplete
          mode={mode}
          passed={hearts > 0}
          perfect={hearts > 0 && wrongCount === 0}
          correctCount={correctCount}
          total={correctCount + wrongCount}
          xpEarned={xpEarned}
          survivalBest={Math.max(bestAtStart, correctCount)}
          isRecord={survival && correctCount > bestAtStart}
          bestStreak={bestStreak}
          onRetry={retry}
          onExit={onExit}
        />
      </>
    )
  }

  const progress = (index + (settled ? 1 : 0)) / total
  const lowTime = timeMs <= 15_000
  const modeLabel = survival ? 'מצב הישרדות' : mode === 'review' ? 'מצב חזרה' : 'מצב מסלול'
  const contextLabel = survival ? chapterLabelForTopic(current.topic) : title
  const ModeIcon = survival ? Flame : mode === 'review' ? Dumbbell : Route

  return (
    <div className="relative min-h-screen">
      <ChapterBackground theme={theme} accent={accent} />

      {/* HUD */}
      <header className="sticky top-0 z-20 border-b border-line glass">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={onExit}
            aria-label="יציאה"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-black/5 hover:text-ink"
          >
            <X size={24} />
          </button>

          {survival ? (
            <>
              <motion.div
                animate={lowTime ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={lowTime ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-extrabold tabular-nums ${
                  lowTime ? 'bg-wrong text-white' : 'bg-ink text-white'
                }`}
              >
                <Clock size={16} strokeWidth={2.5} />
                {fmtTime(timeMs)}
              </motion.div>
              <div className="mr-auto flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1">
                  <Flame size={15} className="text-orange-500" fill="#FB923C" strokeWidth={1.5} />
                  <span className="font-display text-sm font-extrabold text-ink tabular-nums">{streak}</span>
                </span>
                <span className="text-sm font-bold text-ink-soft tabular-nums">{correctCount}</span>
              </div>
            </>
          ) : (
            <>
              <ProgressBar value={progress} className="flex-1" />
              <Hearts count={hearts} />
            </>
          )}
        </div>
      </header>

      {/* Mode banner */}
      <div className="relative z-10 mx-auto mt-4 w-full max-w-2xl px-4 sm:px-6">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-card"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
        >
          <ModeIcon size={18} strokeWidth={2.5} />
          <span className="font-display text-sm font-extrabold">{modeLabel}</span>
          <span className="opacity-70">·</span>
          <span dir="auto" className="truncate text-sm font-semibold opacity-95">
            {contextLabel}
          </span>
          {kind !== 'choice' && (
            <span className="mr-auto shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
              {questionKindLabel(kind)}
            </span>
          )}
        </div>
      </div>

      {/* Question panel (glass) */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-40 pt-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${index}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-pop sm:p-6"
          >
            <h1
              dir="auto"
              className="mb-5 font-display text-xl font-extrabold leading-snug text-ink sm:text-[24px]"
            >
              {current.question}
            </h1>

            {current.image && <QuestionImage src={current.image} />}

            <QuestionRenderer
              question={current}
              phase={phase}
              accent={accent}
              checkNonce={checkNonce}
              onReadyChange={onReadyChange}
              onResult={settle}
            />

            {settled && (
              <ExplanationPanel
                explanation={current.explanation}
                correct={phase === 'correct'}
                correctAnswer={current.correct_answer}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomActionBar
        phase={phase}
        canCheck={ready}
        isLast={isLast}
        onCheck={handleCheck}
        onContinue={handleContinue}
        hideCheck={isMatching}
        hint={isMatching ? 'התאימו את כל הזוגות כדי להמשיך' : undefined}
        correctLabel={survival ? '+3 שניות ⏱' : undefined}
      />

      {survival && paused && phase === 'incorrect' && (
        <div className="pointer-events-none fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          ⏸ הטיימר מושהה
        </div>
      )}
    </div>
  )
}
