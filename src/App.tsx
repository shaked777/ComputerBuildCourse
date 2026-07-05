import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ModuleId, SessionQuestion } from './types'
import { MODULES } from './data/modules'
import { useProgress } from './state/progress'
import { buildModuleSession, buildReviewSession, buildSurvivalDeck, buildDailyReviewSession } from './lib/session'
import { setMuted } from './lib/sound'
import Header from './components/Header'
import LearningPath from './components/LearningPath'
import QuizSession from './components/QuizSession'
import ExamSession from './components/ExamSession'
import StatsView from './components/StatsView'
import CrownModal from './components/CrownModal'
import AchievementToast from './components/AchievementToast'

type View =
  | { kind: 'path' }
  | { kind: 'module'; id: ModuleId }
  | { kind: 'review' }
  | { kind: 'daily' }
  | { kind: 'survival' }
  | { kind: 'exam' }
  | { kind: 'stats' }

export default function App() {
  const { state, reset, recordSurvival, unlockChapter } = useProgress()
  const [view, setView] = useState<View>({ kind: 'path' })
  const [crownOpen, setCrownOpen] = useState(false)

  // Keep the audio engine in sync with the persisted mute setting.
  useEffect(() => setMuted(state.muted), [state.muted])

  const goHome = useCallback(() => setView({ kind: 'path' }), [])

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
            <Header onOpenCrown={() => setCrownOpen(true)} onOpenStats={() => setView({ kind: 'stats' })} />
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
      <AchievementToast />
    </div>
  )
}
