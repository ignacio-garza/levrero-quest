import type { Prepared } from '../game/prepare'
import type { RoundSummary } from './Round'

function correctText(p: Prepared): string {
  switch (p.kind) {
    case 'mc':
      return p.options[p.correct]
    case 'tf':
      return p.correct ? 'True' : 'False'
    case 'match':
      return p.left.map((l, i) => `${l} → ${p.right[p.solution[i]]}`).join('; ')
    case 'num':
      return `${p.answer}${p.unit ?? ''}`
  }
}

interface Props {
  title: string
  summary: RoundSummary
  onAgain: () => void
  onHome: () => void
}

export default function Results({ title, summary, onAgain, onHome }: Props) {
  const pct = Math.round((summary.correct / summary.total) * 100)
  const verdict = pct === 100 ? 'Flawless! 🏆' : pct >= 80 ? 'Strong round 💪' : pct >= 50 ? 'Getting there 📈' : 'Keep drilling: that is how it sticks 🔁'

  return (
    <section className="results">
      <h1>{verdict}</h1>
      <p className="muted">{title}</p>
      <div className="stats">
        <div><strong>{summary.correct}/{summary.total}</strong><span>correct</span></div>
        <div><strong>+{summary.xp}</strong><span>XP</span></div>
        <div><strong>×{summary.bestCombo}</strong><span>best combo</span></div>
      </div>

      {summary.missed.length > 0 && (
        <div className="card">
          <h2>Review what you missed</h2>
          <ul className="missed">
            {summary.missed.map((m, i) => (
              <li key={`${m.q.id}-${i}`}>
                <div className="missed-q">{m.text}</div>
                <div className="missed-a">✔ {correctText(m)}</div>
                {m.explain && <div className="muted">{m.explain}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="actions">
        <button className="primary" onClick={onAgain}>Play again</button>
        <button onClick={onHome}>Home</button>
      </div>
    </section>
  )
}
