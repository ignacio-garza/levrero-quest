import { useState } from 'react'
import { ESSAYS } from '../data'
import type { EssayCard } from '../types'
import { gradeNumber } from '../game/prepare'
import { makeForwardDrill } from '../game/forward'
import type { EssayState, Progress } from '../game/store'

export function EssayList({ progress, onOpen, onBack }: { progress: Progress; onOpen: (id: string) => void; onBack: () => void }) {
  return (
    <section>
      <div className="round-head">
        <button className="ghost" onClick={onBack} aria-label="Back">←</button>
        <div className="round-title">Mini-essays</div>
        <div />
      </div>
      <p className="muted">
        The lecturer flagged these as likely exam questions. Answer in your own words (or aloud), then reveal the key points and tick what you covered.
      </p>
      <div className="topics">
        {ESSAYS.map((e) => {
          const s = progress.essays[e.id]
          return (
            <button key={e.id} className="topic" onClick={() => onOpen(e.id)}>
              <div className="topic-head"><strong>{e.title}</strong></div>
              <div className="muted small">{e.where}</div>
              <div className="small">
                {e.pending && <span className="badge">not covered yet</span>}
                {s?.lastScore !== undefined && <span className="badge ok">last: {s.lastScore}/{s.lastTotal}</span>}
                {s && s.attempts > 0 && <span className="muted"> · {s.attempts} attempt{s.attempts === 1 ? '' : 's'}</span>}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ForwardDrill() {
  const [d, setD] = useState(() => makeForwardDrill())
  const [val, setVal] = useState('')
  const [res, setRes] = useState<boolean | null>(null)

  return (
    <div className="card drill">
      <h3>Calculation drill</h3>
      <p>
        An asset maturing in <strong>{d.n}</strong> years pays <strong>{d.Rn}%</strong> a year; one maturing in <strong>{d.n - 1}</strong> year{d.n - 1 === 1 ? '' : 's'} pays <strong>{d.Rn1}%</strong>.
        What is the forward short rate for year {d.n}?
      </p>
      <form
        className="num"
        onSubmit={(e) => {
          e.preventDefault()
          if (res !== null || val.trim() === '') return
          setRes(gradeNumber({ answer: d.answer, tolerance: 0.05 }, val))
        }}
      >
        <input inputMode="decimal" value={val} disabled={res !== null} placeholder="r_n in %" aria-label="Forward rate in percent" className={res === null ? '' : res ? 'right' : 'wrong'} onChange={(e) => setVal(e.target.value)} />
        <span className="unit">%</span>
        {res === null ? (
          <button className="primary" type="submit" disabled={val.trim() === ''}>Check</button>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() => {
              setD(makeForwardDrill())
              setVal('')
              setRes(null)
            }}
          >
            New numbers
          </button>
        )}
      </form>
      {res !== null && (
        <div className={`feedback ${res ? 'ok' : 'bad'}`}>
          <strong>{res ? 'Correct!' : `Not quite: ${d.answer}%`}</strong>
          <p>{d.explain}</p>
        </div>
      )}
    </div>
  )
}

interface CardProps {
  card: EssayCard
  state: EssayState | undefined
  onDraft: (text: string) => void
  onScore: (score: number, total: number) => void
  onBack: () => void
}

export function EssayView({ card, state, onDraft, onScore, onBack }: CardProps) {
  const [revealed, setRevealed] = useState(false)
  const [ticked, setTicked] = useState<boolean[]>(() => card.keyPoints.map(() => false))
  const [saved, setSaved] = useState(false)
  const score = ticked.filter(Boolean).length

  return (
    <section>
      <div className="round-head">
        <button className="ghost" onClick={onBack} aria-label="Back">←</button>
        <div className="round-title">{card.title}</div>
        <div />
      </div>

      <div className="card">
        <h2 className="q-text">{card.prompt}</h2>
        <blockquote>“{card.quote}”</blockquote>
        <div className="muted small">{card.where}</div>
        {card.pending && <p className="warn">This topic hasn't been covered in class yet. Only partial points are listed.</p>}
      </div>

      <label className="sr-only" htmlFor="draft">Your answer</label>
      <textarea
        id="draft"
        placeholder="Write your answer here, as you would in the exam…"
        value={state?.draft ?? ''}
        onChange={(e) => onDraft(e.target.value)}
        rows={9}
      />

      {card.drill === 'forward' && <ForwardDrill />}

      {!revealed ? (
        <button className="primary big" onClick={() => setRevealed(true)}>Reveal key points</button>
      ) : (
        <div className="card">
          <h3>Tick what your answer covered</h3>
          <ul className="checklist">
            {card.keyPoints.map((k, i) => (
              <li key={k}>
                <label>
                  <input
                    type="checkbox"
                    checked={ticked[i]}
                    onChange={() => {
                      setSaved(false)
                      setTicked(ticked.map((t, j) => (j === i ? !t : t)))
                    }}
                  />
                  <span>{k}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="level-row">
            <strong>{score}/{card.keyPoints.length} covered</strong>
            <button
              className="primary"
              disabled={saved}
              onClick={() => {
                onScore(score, card.keyPoints.length)
                setSaved(true)
              }}
            >
              {saved ? 'Saved ✓' : 'Save score'}
            </button>
          </div>
          <button
            className="ghost"
            onClick={() => {
              onDraft('')
              setTicked(card.keyPoints.map(() => false))
              setRevealed(false)
              setSaved(false)
            }}
          >
            Clear draft and try again
          </button>
        </div>
      )}
    </section>
  )
}
