import { useEffect, useState } from 'react'
import OptionCard, { type OptionState } from '../OptionCard'
import { playTap } from '../../lib/sound'
import type { RendererProps } from './types'

const HEB_MARKERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

/** Classic Duolingo/Brilliant multiple-choice cards. */
export default function ChoiceRenderer({
  question,
  phase,
  checkNonce,
  onReadyChange,
  onResult,
}: RendererProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const settled = phase !== 'answering'

  useEffect(() => onReadyChange(selected != null), [selected, onReadyChange])
  useEffect(() => {
    if (checkNonce > 0) onResult(selected === question.correct_answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkNonce])

  function state(opt: string): OptionState {
    if (!settled) return selected === opt ? 'selected' : 'idle'
    if (opt === question.correct_answer) return 'correct'
    if (opt === selected) return 'wrong'
    return 'muted'
  }

  return (
    <div className="flex flex-col gap-3">
      {question.shuffledOptions.map((opt, i) => (
        <OptionCard
          key={opt + i}
          text={opt}
          marker={HEB_MARKERS[i] ?? String(i + 1)}
          state={state(opt)}
          disabled={settled}
          onClick={() => {
            if (settled) return
            playTap()
            setSelected(opt)
          }}
        />
      ))}
    </div>
  )
}
