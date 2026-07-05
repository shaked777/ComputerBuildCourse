import {
  Footprints,
  Target,
  Medal,
  Zap,
  Sparkles,
  Flame,
  Timer,
  GraduationCap,
  BookOpenCheck,
  Mountain,
  type LucideIcon,
} from 'lucide-react'
import type { ProgressState } from '../types'
import { MODULES } from './modules'
import { moduleQuestionCount } from '../lib/questions'
import { streakDays } from '../lib/stats'

export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: LucideIcon
  /** Pure predicate over the persisted state. */
  check: (s: ProgressState) => boolean
}

/** All achievements, evaluated by the progress provider after every state change. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-answer',
    title: 'צעד ראשון',
    desc: 'עניתם על השאלה הראשונה',
    icon: Footprints,
    check: (s) => s.totalAnswered >= 1,
  },
  {
    id: 'correct-25',
    title: 'צלף מתחיל',
    desc: '25 תשובות נכונות',
    icon: Target,
    check: (s) => s.totalCorrect >= 25,
  },
  {
    id: 'correct-100',
    title: 'מאה נכונות',
    desc: '100 תשובות נכונות',
    icon: Medal,
    check: (s) => s.totalCorrect >= 100,
  },
  {
    id: 'xp-500',
    title: 'אספן נקודות',
    desc: 'צברתם 500 XP',
    icon: Zap,
    check: (s) => s.xp >= 500,
  },
  {
    id: 'perfect-session',
    title: 'ללא רבב',
    desc: 'סשן שלם בלי אף טעות',
    icon: Sparkles,
    check: (s) => s.perfectSessions >= 1,
  },
  {
    id: 'streak-3',
    title: 'שלושה ברצף',
    desc: 'למדתם 3 ימים ברציפות',
    icon: Flame,
    check: (s) => streakDays(s.daily) >= 3,
  },
  {
    id: 'survival-15',
    title: 'שורד מקצועי',
    desc: '15 נכונות בריצת הישרדות אחת',
    icon: Timer,
    check: (s) => s.survivalBest >= 15,
  },
  {
    id: 'exam-85',
    title: 'מוכן למבחן',
    desc: 'ציון 85+ במבחן מתכונת',
    icon: GraduationCap,
    check: (s) => s.examBest >= 85,
  },
  {
    id: 'chapter-done',
    title: 'פרק הושלם',
    desc: 'שליטה מלאה בפרק שלם',
    icon: BookOpenCheck,
    check: (s) =>
      MODULES.some((m) => {
        const total = moduleQuestionCount(m.id)
        return total > 0 && (s.modules[m.id]?.masteredIds.length ?? 0) >= total
      }),
  },
  {
    id: 'marathon',
    title: 'מרתון',
    desc: '250 שאלות נענו סה"כ',
    icon: Mountain,
    check: (s) => s.totalAnswered >= 250,
  },
]

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
