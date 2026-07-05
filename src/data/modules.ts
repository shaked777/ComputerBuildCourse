import {
  Gauge,
  Binary,
  CircuitBoard,
  Terminal,
  Cpu,
  Repeat,
  GitBranch,
} from 'lucide-react'
import type { ModuleDef } from '../types'

/**
 * The learning path mirrors the actual course chapters of 10145.
 * `topics` holds the exact strings used in questions.json; a chapter may span
 * several topics, and some chapters have no questions yet (rendered "coming soon").
 */
export const MODULES: ModuleDef[] = [
  {
    id: 'abstraction',
    chapter: 'פרק א',
    title: 'הפשטה של מחשבים',
    subtitle: 'Performance · Amdahl',
    topics: ['ביצועי מעבד (Performance)', 'ביצועי מעבד (חוק אמדל)', "ביצועי מעבד (Amdahl's Law)"],
    icon: Gauge,
    accent: '#F59E0B',
    accentSoft: '#FEF3DA',
    theme: 'blueprint',
  },
  {
    id: 'representation',
    chapter: 'פרק ב',
    title: 'ייצוג מידע במחשב',
    subtitle: 'Conversions · IEEE 754',
    topics: ['המרות בסיסים וייצוג נתונים', 'ייצוג נתונים ונקודה צפה', 'ייצוג נתונים - המרות'],
    icon: Binary,
    accent: '#3B82F6',
    accentSoft: '#E8F0FE',
    theme: 'binary',
  },
  {
    id: 'boolean',
    chapter: 'פרק ג',
    title: 'אלגברה בוליאנית ומעגלים לוגיים',
    subtitle: 'Boolean Algebra',
    topics: ['אלגברה בוליאנית ושערים לוגיים'],
    icon: CircuitBoard,
    accent: '#A855F7',
    accentSoft: '#F3E8FF',
    theme: 'circuit',
  },
  {
    id: 'mips',
    chapter: 'פרק ד',
    title: 'פקודות שפת המכונה',
    subtitle: 'MIPS Assembly',
    topics: ['שפת סף MIPS'],
    icon: Terminal,
    accent: '#10B981',
    accentSoft: '#E2F7EF',
    theme: 'terminal',
  },
  {
    id: 'singlecycle',
    chapter: 'פרק ז',
    title: 'מעבד חד-מחזורי',
    subtitle: 'Single-Cycle Datapath',
    topics: ['מעבד חד-מחזורי (Single-Cycle)'],
    icon: Cpu,
    accent: '#06B6D4',
    accentSoft: '#E0F7FB',
    theme: 'datapath',
  },
  {
    id: 'multicycle',
    chapter: 'פרק ח',
    title: 'מעבד רב-מחזורי',
    subtitle: 'Multi-Cycle CPU',
    topics: ['מעבד רב-מחזורי (Multi-Cycle)'],
    icon: Repeat,
    accent: '#EC4899',
    accentSoft: '#FCE7F2',
    theme: 'datapath',
  },
  {
    id: 'pipeline',
    chapter: 'פרק ט',
    title: 'שיפור ביצועים בצנרת',
    subtitle: 'Pipelining · Cache',
    topics: ['מסלול נתונים וצנרת', 'זיכרון מטמון (Cache)'],
    icon: GitBranch,
    accent: '#6366F1',
    accentSoft: '#E9EAFE',
    theme: 'pipeline',
  },
]

/** Number of questions in a single bite-sized session. */
export const SESSION_SIZE = 6
/** Hearts granted per session (and per survival run). */
export const SESSION_HEARTS = 3
/** XP awarded per correct answer. */
export const XP_PER_CORRECT = 10
/** Bonus XP for clearing a session with zero mistakes. */
export const XP_PERFECT_BONUS = 25
/** Bonus XP for simply clearing a session. */
export const XP_CLEAR_BONUS = 10
