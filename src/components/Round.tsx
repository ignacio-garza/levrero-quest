import { useMemo, useState } from 'react'
import type { Question } from '../types'
import { TOPIC_BY_ID } from '../data/topics'
import { prepare, type Prepared } from '../game/prepare'
import { xpForAnswer } from '../game/xp'
import QuestionCard from './QuestionCard'

export interface RoundSummary {
  correct: number
  total: number
  xp: number
  bestCombo: number
  missed: Prepared[]
}

interface Props {
  title: string
  questions: Question[]
  onAnswer: (id: string, correct: boolean, xp: number) => void
  onFinish: (s: RoundSummary) => void
  onQuit: () => void
}

export default function Round({ title, questions, onAnswer, onFinish, onQuit }: Props) {
  const prepared = useMemo(() => questions.map((q) => prepare(q)), [questions])
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState(0)
  const [missed, setMissed] = useState<Prepared[]>([])

  const p = prepared[idx]
  const last = idx === prepared.length - 1

  const answered = (ok: boolean) => {
    const gain = ok ? xpForAnswer(combo) : 0
    setFeedback(ok)
    setXp(xp + gain)
    if (ok) {
      setCorrect(correct + 1)
      setCombo(combo + 1)
      setBestCombo(Math.max(bestCombo, combo + 1))
    } else {
      setCombo(0)
      setMissed([...missed, p])
    }
    onAnswer(p.q.id, ok, gain)
  }

  const next = () => {
    if (last) {
      onFinish({ correct, total: prepared.length, xp, bestCombo, missed })
    } else {
      setIdx(idx + 1)
      setFeedback(null)
    }
  }

  const topic = TOPIC_BY_ID[p.q.topic]

  return (
    <section className="round">
      <div className="round-head">
        <button className="ghost" onClick={onQuit} aria-label="Quit round">✕</button>
        <div className="round-title">{title}</div>
        <div className="combo" aria-live="polite">{combo >= 2 ? `🔥 ×${combo}` : ''}</div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={prepared.length} aria-valuenow={idx + (feedback === null ? 0 : 1)}>
        <div style={{ width: `${((idx + (feedback === null ? 0 : 1)) / prepared.length) * 100}%` }} />
      </div>
      <div className="meta">
        <span>{topic.emoji} {topic.name}</span>
        <span>{idx + 1} / {prepared.length}</span>
      </div>

      <div className="card">
        <QuestionCard key={`${p.q.id}-${idx}`} p={p} onAnswered={answered} />

        {feedback !== null && (
          <div className={`feedback ${feedback ? 'ok' : 'bad'}`} role="status">
            <strong>{feedback ? `Correct! +${xpForAnswer(combo - 1)} XP` : 'Not quite.'}</strong>
            {p.explain && <p>{p.explain}</p>}
            {p.q.verified === false && (
              <p className="warn">⚠ Built from reconstructed notes: check against the slides.</p>
            )}
            <button className="primary" autoFocus onClick={next}>
              {last ? 'See results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
