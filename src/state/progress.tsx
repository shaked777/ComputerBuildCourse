import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { ModuleId, ModuleProgress, NodeStatus, ProgressState } from '../types'
import { MODULES, XP_PER_CORRECT, XP_PERFECT_BONUS, XP_CLEAR_BONUS } from '../data/modules'
import { moduleQuestionCount } from '../lib/questions'
import { ACHIEVEMENTS } from '../data/achievements'
import { nextSrs } from '../lib/srs'
import { dayKey } from '../lib/stats'
import { saveProgressToCloud, loadProgressFromCloud } from '../lib/profileApi'

const hasContent = (id: ModuleId) => moduleQuestionCount(id) > 0

const STORAGE_KEY = 'assembly-quest:progress:v5'
/** Older saves we can migrate forward (newest first). */
const LEGACY_KEYS = ['assembly-quest:progress:v4', 'assembly-quest:progress:v3']
export const DEFAULT_NAME = 'שחקן 1'

function emptyModuleProgress(): ModuleProgress {
  return { masteredIds: [], passedSessions: 0 }
}

function initialState(): ProgressState {
  const modules = {} as Record<ModuleId, ModuleProgress>
  for (const m of MODULES) modules[m.id] = emptyModuleProgress()
  return {
    username: DEFAULT_NAME,
    onboarded: false,
    xp: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    perfectSessions: 0,
    survivalBest: 0,
    examBest: 0,
    unlocked: [],
    muted: false,
    mistakes: [],
    srs: {},
    daily: {},
    achievements: [],
    modules,
  }
}

/** Merge a (possibly partial / older-schema) save into a fresh base state. */
function mergeSave(parsed: Partial<ProgressState>): ProgressState {
  const base = initialState()
  return {
    ...base,
    ...parsed,
    username: parsed.username?.trim() || base.username,
    // Players who already chose a custom name are considered onboarded.
    onboarded:
      parsed.onboarded ?? Boolean(parsed.username && parsed.username.trim() !== DEFAULT_NAME),
    unlocked: parsed.unlocked ?? [],
    mistakes: parsed.mistakes ?? [],
    srs: parsed.srs ?? {},
    daily: parsed.daily ?? {},
    achievements: parsed.achievements ?? [],
    modules: { ...base.modules, ...(parsed.modules ?? {}) },
  }
}

function loadState(): ProgressState {
  if (typeof window === 'undefined') return initialState()
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return mergeSave(JSON.parse(stored) as Partial<ProgressState>)
    // Legacy migration: the question bank was rebuilt in v5, so ids stored in
    // mistakes/srs/masteredIds refer to different questions — reset those, but
    // keep the player's identity, XP, records, streaks and achievements.
    for (const key of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(key)
      if (legacy) {
        const migrated = mergeSave(JSON.parse(legacy) as Partial<ProgressState>)
        return {
          ...migrated,
          mistakes: [],
          srs: {},
          modules: Object.fromEntries(
            Object.entries(migrated.modules).map(([id, mod]) => [
              id,
              { masteredIds: [] as number[], passedSessions: mod.passedSessions },
            ]),
          ) as unknown as ProgressState['modules'],
        }
      }
    }
    return initialState()
  } catch {
    return initialState()
  }
}

type Action =
  | { type: 'ANSWER'; questionId: number; moduleId: ModuleId; correct: boolean }
  | { type: 'COMPLETE_SESSION'; moduleId: ModuleId; passed: boolean; perfect: boolean }
  | { type: 'RECORD_SURVIVAL'; score: number }
  | { type: 'RECORD_EXAM'; scorePct: number }
  | { type: 'SET_USERNAME'; name: string }
  | { type: 'ONBOARD'; name: string }
  | { type: 'UNLOCK'; moduleId: ModuleId }
  | { type: 'UNLOCK_ACHIEVEMENTS'; ids: string[] }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'HYDRATE'; state: ProgressState }
  | { type: 'RESET' }

function uniquePush<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list : [...list, item]
}

/** Add xp/answered/correct to today's activity log. */
function bumpDaily(
  daily: ProgressState['daily'],
  delta: { answered?: number; correct?: number; xp?: number },
): ProgressState['daily'] {
  const key = dayKey()
  const day = daily[key] ?? { answered: 0, correct: 0, xp: 0 }
  return {
    ...daily,
    [key]: {
      answered: day.answered + (delta.answered ?? 0),
      correct: day.correct + (delta.correct ?? 0),
      xp: day.xp + (delta.xp ?? 0),
    },
  }
}

function reducer(state: ProgressState, action: Action): ProgressState {
  switch (action.type) {
    case 'ANSWER': {
      const mod = state.modules[action.moduleId] ?? emptyModuleProgress()
      const srs = { ...state.srs, [action.questionId]: nextSrs(state.srs[action.questionId], action.correct) }

      if (action.correct) {
        return {
          ...state,
          xp: state.xp + XP_PER_CORRECT,
          totalAnswered: state.totalAnswered + 1,
          totalCorrect: state.totalCorrect + 1,
          mistakes: state.mistakes.filter((id) => id !== action.questionId),
          srs,
          daily: bumpDaily(state.daily, { answered: 1, correct: 1, xp: XP_PER_CORRECT }),
          modules: {
            ...state.modules,
            [action.moduleId]: {
              ...mod,
              masteredIds: uniquePush(mod.masteredIds, action.questionId),
            },
          },
        }
      }
      return {
        ...state,
        totalAnswered: state.totalAnswered + 1,
        mistakes: uniquePush(state.mistakes, action.questionId),
        srs,
        daily: bumpDaily(state.daily, { answered: 1 }),
      }
    }

    case 'COMPLETE_SESSION': {
      if (!action.passed) return state
      const mod = state.modules[action.moduleId] ?? emptyModuleProgress()
      const bonus = XP_CLEAR_BONUS + (action.perfect ? XP_PERFECT_BONUS : 0)
      return {
        ...state,
        xp: state.xp + bonus,
        perfectSessions: state.perfectSessions + (action.perfect ? 1 : 0),
        daily: bumpDaily(state.daily, { xp: bonus }),
        modules: {
          ...state.modules,
          [action.moduleId]: { ...mod, passedSessions: mod.passedSessions + 1 },
        },
      }
    }

    case 'RECORD_SURVIVAL':
      return action.score > state.survivalBest ? { ...state, survivalBest: action.score } : state

    case 'RECORD_EXAM':
      return action.scorePct > state.examBest ? { ...state, examBest: action.scorePct } : state

    case 'SET_USERNAME':
      return { ...state, username: action.name.trim() || DEFAULT_NAME }

    case 'ONBOARD':
      return { ...state, username: action.name.trim() || DEFAULT_NAME, onboarded: true }

    case 'UNLOCK':
      return { ...state, unlocked: uniquePush(state.unlocked, action.moduleId) }

    case 'UNLOCK_ACHIEVEMENTS':
      return { ...state, achievements: [...state.achievements, ...action.ids] }

    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }

    // Restore a cloud-saved profile (sanitized through the same merge as local saves).
    case 'HYDRATE':
      return mergeSave(action.state)

    case 'RESET':
      return initialState()

    default:
      return state
  }
}

/* ------------------------------- selectors ------------------------------- */

export function moduleMastery(state: ProgressState, moduleId: ModuleId): number {
  const total = moduleQuestionCount(moduleId)
  if (total === 0) return 0
  const done = state.modules[moduleId]?.masteredIds.length ?? 0
  return Math.min(1, done / total)
}

export function moduleStatus(state: ProgressState, moduleId: ModuleId): NodeStatus {
  if (!hasContent(moduleId)) return 'soon'

  const index = MODULES.findIndex((m) => m.id === moduleId)
  let prev: ModuleId | null = null
  for (let i = index - 1; i >= 0; i--) {
    if (hasContent(MODULES[i].id)) {
      prev = MODULES[i].id
      break
    }
  }
  const unlocked =
    state.unlocked.includes(moduleId) || prev === null || state.modules[prev].passedSessions > 0
  if (!unlocked) return 'locked'

  if (moduleMastery(state, moduleId) >= 1) return 'completed'

  const mod = state.modules[moduleId]
  if (mod.passedSessions > 0 || mod.masteredIds.length > 0) return 'in-progress'
  return 'available'
}

/* ------------------------------- context ------------------------------- */

interface ProgressContextValue {
  state: ProgressState
  answer: (args: { questionId: number; moduleId: ModuleId; correct: boolean }) => void
  completeSession: (args: { moduleId: ModuleId; passed: boolean; perfect: boolean }) => void
  recordSurvival: (score: number) => void
  recordExam: (scorePct: number) => void
  setUsername: (name: string) => void
  completeOnboarding: (name: string) => void
  unlockChapter: (moduleId: ModuleId) => void
  toggleMute: () => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  // Blocks cloud saves until the one-time restore attempt has finished, so a
  // brand-new empty state can never clobber an existing cloud backup.
  const cloudReady = useRef(false)
  const restoreRan = useRef(false)
  const saveTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [state])

  // One-time cloud restore: if this browser has no local progress but the
  // player's cloud backup exists, bring it back.
  useEffect(() => {
    if (restoreRan.current) return
    restoreRan.current = true
    const localIsFresh = state.totalAnswered === 0 && state.xp === 0
    void (async () => {
      if (localIsFresh) {
        const cloud = await loadProgressFromCloud()
        if (cloud && (cloud.totalAnswered > 0 || cloud.xp > 0)) {
          dispatch({ type: 'HYDRATE', state: cloud })
        }
      }
      cloudReady.current = true
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced cloud backup on every change (after the restore attempt).
  useEffect(() => {
    if (!cloudReady.current) return
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void saveProgressToCloud(state)
    }, 2000)
    return () => window.clearTimeout(saveTimer.current)
  }, [state])

  // Achievements engine: evaluate rules after every state change and unlock
  // anything newly earned. Safe from loops — unlocked ids are filtered out.
  useEffect(() => {
    const newly = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && a.check(state)).map(
      (a) => a.id,
    )
    if (newly.length > 0) dispatch({ type: 'UNLOCK_ACHIEVEMENTS', ids: newly })
  }, [state])

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      answer: (a) => dispatch({ type: 'ANSWER', ...a }),
      completeSession: (a) => dispatch({ type: 'COMPLETE_SESSION', ...a }),
      recordSurvival: (score) => dispatch({ type: 'RECORD_SURVIVAL', score }),
      recordExam: (scorePct) => dispatch({ type: 'RECORD_EXAM', scorePct }),
      setUsername: (name) => dispatch({ type: 'SET_USERNAME', name }),
      completeOnboarding: (name) => dispatch({ type: 'ONBOARD', name }),
      unlockChapter: (moduleId) => dispatch({ type: 'UNLOCK', moduleId }),
      toggleMute: () => dispatch({ type: 'TOGGLE_MUTE' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within <ProgressProvider>')
  return ctx
}
