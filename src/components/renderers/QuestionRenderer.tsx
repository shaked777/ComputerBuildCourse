import type { ReactElement } from 'react'
import { classifyQuestion } from '../../lib/classify'
import type { QuestionKind } from '../../types'
import ChoiceRenderer from './ChoiceRenderer'
import FillRenderer from './FillRenderer'
import ArrangeRenderer from './ArrangeRenderer'
import MatchingRenderer from './MatchingRenderer'
import type { RendererProps } from './types'

const RENDERERS: Record<QuestionKind, (p: RendererProps) => ReactElement> = {
  choice: ChoiceRenderer,
  fill: FillRenderer,
  arrange: ArrangeRenderer,
  matching: MatchingRenderer,
}

/** Picks the interactive layout for a question and renders it. */
export default function QuestionRenderer(props: RendererProps) {
  const kind = classifyQuestion(props.question)
  const Renderer = RENDERERS[kind]
  return <Renderer {...props} />
}

export function questionKindLabel(kind: QuestionKind): string {
  switch (kind) {
    case 'fill':
      return 'השלמת ערך'
    case 'arrange':
      return 'סידור לפי הסדר'
    case 'matching':
      return 'התאמת זוגות'
    default:
      return ''
  }
}
