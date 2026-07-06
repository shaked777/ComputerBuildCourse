import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ModuleId, SessionQuestion } from './types'
import { MODULES } from './data/modules'
import { useProgress } from './state/progress'
import { buildModuleSession, buildReviewSession, buildSurvivalDeck, buildDailyReviewSession } from './lib/session'
import { setMuted } from './lib/sound'
import {
  challengeIdFromUrl,
  clearChallengeFromUrl,
  fetchChallenge,
  type Challenge,
} from './lib/challengeApi'
import Header from './components/Header'
import LearningPath from './components/LearningPath'
import QuizSession from './components/QuizSession'
import ExamSession from './components/ExamSession'
import StatsView from './components/StatsView'
import CrownModal from './components/CrownModal'
import AchievementToast from './components/AchievementToast'
import WelcomeModal from './components/WelcomeModal'
import ChallengeModal from './components/ChallengeModal'
import DuelResult from './components/DuelResult'

type View =
  | { kind: 'path' }
  | { kind: 'module'; id: ModuleId }
  | { kind: 'review' }
  | { kind: 'daily' }
  | { kind: 'survival' }
  | { kind: 'exam' }
  | { kind: 'stats' }
  | { kind: 'duel' }
  | { kind: 'duelResult'; score: number }

export default function App() {
  const { state, reset, recordSurvival, unlockChapter } = useProgress()
  const [view, setView] = useState<View>({ kind: 'path' })
  const [crownOpen, setCrownOpen] = useState(false)
  const [friendsOpen, setFriendsOpen] = useState(false)
  /** A duel arriving via ?challenge= link, waiting to be accepted. */
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null)

  // Keep the audio engine in sync with the persisted mute setting.
  useEffect(() => setMuted(state.muted), [state.muted])

  // Detect an incoming duel link on load and open the challenge modal.
  useEffect(() => {
    const id = challengeIdFromUrl()
    if (!id) return
    void fetchChallenge(id).then((challenge) => {
      if (challenge && challenge.opponent_score == null) {
        setPendingChallenge(challenge)
        setFriendsOpen(true)
      } else {
        clearChallengeFromUrl() // missing or already-finished duel
      }
    })
  }, [])

  const goHome = useCallback(() => setView({ kind: 'path' }), [])

  const endDuelFlow = useCallback(() => {
    setPendingChallenge(null)
    clearChallengeFromUrl()
    setView({ kind: 'path' })
  }, [])

  const handleReset = useCallback(() => {
    if (window.confirm('לאפס את כל ההתקדמות, ה-XP וההישגים? פעולה זו אינה הפיכה.')) {
      reset()
      setView({ kind: 'path' })
    }
  }, [reset])

  const jumpToChapter = useCallback(
    (id: ModuleId) => {
      unlockChapter(id)
      setCrownOpen(false)
      setView({ kind: 'module', id })
    },
    [unlockChapter],
  )

  const startDuel = useCallback(() => {
    setFriendsOpen(false)
    setView({ kind: 'duel' })
  }, [])

  function renderView() {
    switch (view.kind) {
      case 'module': {
        const def = MODULES.find((m) => m.id === view.id)
        if (!def) return null
        const masteredIds = state.modules[view.id].masteredIds
        const srs = state.srs
        const make = (): SessionQuestion[] => buildModuleSession(view.id, masteredIds, srs)
        return (
          <QuizSession
            key={`module-${view.id}`}
            makeQuestions={make}
            title={`${def.chapter} · ${def.title}`}
            accent={def.accent}
            theme={def.theme}
            mode="path"
            moduleId={view.id}
            onExit={goHome}
          />
        )
      }

      case 'survival':
        return (
          <QuizSession
            key="survival"
            makeQuestions={buildSurvivalDeck}
            title="כל הבנק"
            accent="#F97316"
            theme="neutral"
            mode="survival"
            survivalBest={state.survivalBest}
            onSurvivalEnd={recordSurvival}
            onExit={goHome}
          />
        )

      case 'duel':
        return (
          <QuizSession
            key="duel"
            makeQuestions={buildSurvivalDeck}
            title={pendingChallenge ? `דו־קרב מול ${pendingChallenge.challenger_name}` : 'דו־קרב חברים'}
            accent="#E11D48"
            theme="neutral"
            mode="survival"
            survivalBest={state.survivalBest}
            exitOnEnd
            onSurvivalEnd={(score) => {
              recordSurvival(score)
              setView({ kind: 'duelResult', score })
            }}
            onExit={endDuelFlow}
          />
        )

      case 'duelResult':
        return (
          <DuelResult
            key="duel-result"
            mode={pendingChallenge ? 'accept' : 'create'}
            myName={state.username}
            myScore={view.score}
            challenge={pendingChallenge ?? undefined}
            onHome={endDuelFlow}
          />
        )

      case 'review': {
        const mistakeIds = state.mistakes
        const make = (): SessionQuestion[] => buildReviewSession(mistakeIds)
        return (
          <QuizSession
            key="review"
            makeQuestions={make}
            title="תרגול נקודות תורפה"
            accent="#FF4B4B"
            theme="neutral"
            mode="review"
            onExit={goHome}
          />
        )
      }

      case 'daily': {
        const srs = state.srs
        return (
          <QuizSession
            key="daily"
            makeQuestions={() => buildDailyReviewSession(srs)}
            title="חזרות להיום"
            accent="#0D9488"
            theme="neutral"
            mode="review"
            onExit={goHome}
          />
        )
      }

      case 'exam':
        return <ExamSession key="exam" onExit={goHome} />

      case 'stats':
        return <StatsView key="stats" onBack={goHome} onReset={handleReset} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view.kind === 'path' ? (
          <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Header
              onOpenCrown={() => setCrownOpen(true)}
              onOpenStats={() => setView({ kind: 'stats' })}
              onOpenFriends={() => setFriendsOpen(true)}
              hasPendingChallenge={pendingChallenge !== null}
            />
            <LearningPath
              onStartModule={(id) => setView({ kind: 'module', id })}
              onReview={() => setView({ kind: 'review' })}
              onSurvival={() => setView({ kind: 'survival' })}
              onExam={() => setView({ kind: 'exam' })}
              onDailyReview={() => setView({ kind: 'daily' })}
            />
          </motion.div>
        ) : (
          <motion.div
            key={view.kind === 'module' ? `module-${view.id}` : view.kind}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        )}
      </AnimatePresence>

      <CrownModal open={crownOpen} onClose={() => setCrownOpen(false)} onJump={jumpToChapter} />
      <ChallengeModal
        open={friendsOpen}
        pending={pendingChallenge}
        onClose={() => setFriendsOpen(false)}
        onStartDuel={startDuel}
      />
      <AchievementToast />

      {/* First-open onboarding: ask for the player's name right away. */}
      {!state.onboarded && <WelcomeModal />}
    </div>
  )
}
