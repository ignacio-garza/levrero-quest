import { useState } from 'react'
import { gradeNumber, type Prepared } from '../game/prepare'

interface Props {
  p: Prepared
  onAnswered: (correct: boolean) => void
}

/** Renders one prepared question and reports the result once. Remount (key) for each new question. */
export default function QuestionCard({ p, onAnswered }: Props) {
  const [done, setDone] = useState(false)
  const [picked, setPicked] = useState<number | boolean | null>(null)
  const [sel, setSel] = useState<number[]>(() => (p.kind === 'match' ? p.left.map(() => -1) : []))
  const [num, setNum] = useState('')
  const [numOk, setNumOk] = useState<boolean | null>(null)

  const finish = (correct: boolean) => {
    if (done) return
    setDone(true)
    onAnswered(correct)
  }

  if (p.kind === 'mc') {
    return (
      <div>
        <h2 className="q-text">{p.text}</h2>
        <div className="options">
          {p.options.map((o, i) => {
            const cls = done ? (i === p.correct ? 'opt right' : i === picked ? 'opt wrong' : 'opt dim') : 'opt'
            return (
              <button
                key={o}
                className={cls}
                disabled={done}
                onClick={() => {
                  setPicked(i)
                  finish(i === p.correct)
                }}
              >
                {o}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (p.kind === 'tf') {
    return (
      <div>
        <h2 className="q-text">{p.text}</h2>
        <div className="options tf">
          {[true, false].map((v) => {
            const cls = done ? (v === p.correct ? 'opt right' : v === picked ? 'opt wrong' : 'opt dim') : 'opt'
            return (
              <button
                key={String(v)}
                className={cls}
                disabled={done}
                onClick={() => {
                  setPicked(v)
                  finish(v === p.correct)
                }}
              >
                {v ? 'True' : 'False'}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (p.kind === 'match') {
    const allSet = sel.every((s) => s >= 0)
    return (
      <div>
        <h2 className="q-text">{p.text}</h2>
        <div className="match">
          {p.left.map((l, i) => {
            const ok = done && sel[i] === p.solution[i]
            const bad = done && !ok
            return (
              <div key={l} className={`match-row ${ok ? 'right' : ''} ${bad ? 'wrong' : ''}`}>
                <div className="match-left">{l}</div>
                <select
                  value={sel[i]}
                  disabled={done}
                  aria-label={`Match for ${l}`}
                  onChange={(e) => setSel(sel.map((s, j) => (j === i ? Number(e.target.value) : s)))}
                >
                  <option value={-1}>Choose…</option>
                  {p.right.map((r, k) => (
                    <option key={r} value={k}>
                      {r}
                    </option>
                  ))}
                </select>
                {bad && <div className="match-fix">→ {p.right[p.solution[i]]}</div>}
              </div>
            )
          })}
        </div>
        {!done && (
          <button className="primary" disabled={!allSet} onClick={() => finish(sel.every((s, i) => s === p.solution[i]))}>
            Check
          </button>
        )}
      </div>
    )
  }

  // numeric
  return (
    <div>
      <h2 className="q-text">{p.text}</h2>
      <form
        className="num"
        onSubmit={(e) => {
          e.preventDefault()
          if (done || num.trim() === '') return
          const ok = gradeNumber(p, num)
          setNumOk(ok)
          finish(ok)
        }}
      >
        <input
          inputMode="decimal"
          autoFocus
          disabled={done}
          value={num}
          placeholder="Your answer"
          aria-label="Your numeric answer"
          className={numOk === null ? '' : numOk ? 'right' : 'wrong'}
          onChange={(e) => setNum(e.target.value)}
        />
        {p.unit && <span className="unit">{p.unit}</span>}
        {!done && (
          <button className="primary" type="submit" disabled={num.trim() === ''}>
            Check
          </button>
        )}
      </form>
      {done && !numOk && <p className="answer-line">Answer: <strong>{p.answer}{p.unit ?? ''}</strong></p>}
    </div>
  )
}
