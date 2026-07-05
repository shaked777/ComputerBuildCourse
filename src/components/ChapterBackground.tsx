import { useMemo, type CSSProperties } from 'react'
import type { ThemeKey } from '../types'

interface ChapterBackgroundProps {
  theme: ThemeKey
  accent: string
}

/** Base page color behind the glass content for each theme. */
export function themeBaseStyle(theme: ThemeKey): CSSProperties {
  switch (theme) {
    case 'terminal':
      return { background: 'linear-gradient(160deg, #0B1020 0%, #111726 60%, #0E1424 100%)' }
    case 'blueprint':
      return { background: 'linear-gradient(160deg, #EAF1FB 0%, #F4F8FE 100%)' }
    case 'binary':
      return { background: 'linear-gradient(160deg, #ECFBF3 0%, #F3FBFA 100%)' }
    case 'circuit':
      return { background: 'linear-gradient(160deg, #F6EEFE 0%, #FAF5FF 100%)' }
    case 'datapath':
      return { background: 'linear-gradient(160deg, #E8FAFE 0%, #F2FBFE 100%)' }
    case 'pipeline':
      return { background: 'linear-gradient(160deg, #EEF0FE 0%, #F5F6FF 100%)' }
    default:
      return { background: '#FBFBFD' }
  }
}

/** Is the chapter theme dark (so HUD text should flip light)? */
export function themeIsDark(theme: ThemeKey): boolean {
  return theme === 'terminal'
}

function Blueprint({ accent }: { accent: string }) {
  const eqs = ['Speedup = 1 / ((1−p) + p/s)', 'CPU Time = IC × CPI × T', 'MIPS = f / (CPI × 10⁶)', 'AMAT = HitTime + MissRate × Penalty']
  return (
    <div className="absolute inset-0" style={{ color: accent }}>
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `linear-gradient(${accent}55 1px, transparent 1px), linear-gradient(90deg, ${accent}55 1px, transparent 1px)`,
          backgroundSize: '34px 34px',
        }}
      />
      {eqs.map((e, i) => (
        <span
          key={e}
          className="absolute font-mono text-sm font-semibold"
          style={{
            left: `${8 + (i % 2) * 52}%`,
            top: `${14 + i * 21}%`,
            opacity: 0.22,
            animation: `bgFloat ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
            direction: 'ltr',
          }}
        >
          {e}
        </span>
      ))}
    </div>
  )
}

function BinaryRain({ accent }: { accent: string }) {
  const cols = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: (i / 14) * 100,
        dur: 6 + ((i * 7) % 9),
        delay: -((i * 3) % 8),
        bits: Array.from({ length: 26 }).map(() => (Math.random() > 0.5 ? '1' : '0')).join(' '),
      })),
    [],
  )
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ color: accent }}>
      {cols.map((c, i) => (
        <pre
          key={i}
          className="absolute top-0 m-0 font-mono text-[13px] leading-5 font-bold"
          style={{
            left: `${c.left}%`,
            opacity: 0.16,
            animation: `bgRain ${c.dur}s linear infinite`,
            animationDelay: `${c.delay}s`,
            whiteSpace: 'pre',
          }}
        >
          {c.bits.split(' ').join('\n')}
        </pre>
      ))}
    </div>
  )
}

function Circuit({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" style={{ opacity: 0.2 }}>
      <g stroke={accent} strokeWidth="2" fill="none">
        <path d="M0 80 H120 V160 H260 V60 H400" strokeDasharray="6 8" style={{ animation: 'bgDash 8s linear infinite' }} />
        <path d="M0 300 H90 V220 H220 V330 H400" strokeDasharray="6 8" style={{ animation: 'bgDash 11s linear infinite' }} />
        <path d="M60 0 V120 H160 V400" strokeDasharray="6 8" style={{ animation: 'bgDash 9s linear infinite' }} />
      </g>
      {[[120, 160], [260, 60], [90, 220], [220, 330], [160, 120]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={accent} style={{ animation: `bgPulse ${3 + i}s ease-in-out infinite` }} />
      ))}
      {/* a couple of logic-gate glyphs */}
      <g stroke={accent} strokeWidth="2" fill="none" opacity="0.7">
        <path d="M300 200 q30 0 30 20 q0 20 -30 20 z" />
        <path d="M120 320 h24 a14 14 0 0 1 0 28 h-24 z" />
      </g>
    </svg>
  )
}

function TerminalBg({ accent }: { accent: string }) {
  const lines = ['$ add $t0, $t1, $t2', '$ lw $s0, 0($sp)', '$ beq $t0, $zero, exit', '$ sll $a0, $a0, 2', '$ jal compute']
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* scanlines */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(16,185,129,0.06) 0px, rgba(16,185,129,0.06) 1px, transparent 2px, transparent 4px)' }}
      />
      {/* moving scan bar */}
      <div
        className="absolute left-0 h-24 w-full"
        style={{ background: `linear-gradient(${accent}22, transparent)`, animation: 'bgScan 7s linear infinite' }}
      />
      {lines.map((l, i) => (
        <div
          key={l}
          className="absolute font-mono text-sm font-semibold"
          style={{ left: `${6 + (i % 2) * 46}%`, top: `${16 + i * 16}%`, color: accent, opacity: 0.28, animation: `bgFloat ${7 + i}s ease-in-out infinite`, direction: 'ltr' }}
        >
          {l}
          {i === 0 && <span style={{ animation: 'bgBlink 1s step-end infinite' }}>▋</span>}
        </div>
      ))}
    </div>
  )
}

function Datapath({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" style={{ opacity: 0.18 }}>
      <g stroke={accent} strokeWidth="2.5" fill="none">
        {/* buses */}
        <path d="M20 120 H180 M220 120 H380" />
        <path d="M20 260 H140 M180 260 H380" strokeDasharray="8 10" style={{ animation: 'bgDash 9s linear infinite' }} />
        {/* registers */}
        <rect x="40" y="80" width="46" height="80" rx="4" />
        <rect x="300" y="80" width="46" height="80" rx="4" />
        <rect x="40" y="230" width="46" height="60" rx="4" />
        {/* MUX trapezoids */}
        <path d="M180 100 L210 112 L210 168 L180 180 Z" fill={`${accent}22`} />
        <path d="M180 240 L210 252 L210 288 L180 276 Z" fill={`${accent}22`} />
        {/* ALU */}
        <path d="M250 200 L300 215 L300 285 L250 300 L250 258 L262 250 L250 242 Z" fill={`${accent}18`} />
      </g>
    </svg>
  )
}

function Pipeline({ accent }: { accent: string }) {
  const stages = ['IF', 'ID', 'EX', 'MEM', 'WB']
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ color: accent }}>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="absolute flex gap-3"
          style={{ top: `${18 + row * 26}%`, left: `${row * 8}%`, opacity: 0.16, animation: `bgPulse ${5 + row}s ease-in-out infinite` }}
        >
          {stages.map((s, i) => (
            <div
              key={s}
              className="grid h-16 w-16 place-items-center rounded-xl border-2 font-display text-sm font-extrabold"
              style={{ borderColor: accent, transform: `translateY(${i * 14}px)` }}
            >
              {s}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ChapterBackground({ theme, accent }: ChapterBackgroundProps) {
  return (
    <div data-ambient aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={themeBaseStyle(theme)}>
      {theme === 'blueprint' && <Blueprint accent={accent} />}
      {theme === 'binary' && <BinaryRain accent={accent} />}
      {theme === 'circuit' && <Circuit accent={accent} />}
      {theme === 'terminal' && <TerminalBg accent={accent} />}
      {theme === 'datapath' && <Datapath accent={accent} />}
      {theme === 'pipeline' && <Pipeline accent={accent} />}
    </div>
  )
}
