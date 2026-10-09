import type { Question, TopicId } from '../types'
import { TOPICS } from '../data/topics'
import { topicMastery, weakSpots } from '../game/scheduler'
import type { Progress } from '../game/store'
import { levelProgress, titleFor } from '../game/xp'

interface Props {
  progress: Progress
  pool: Question[]
  onQuick: () => void
  onWeak: () => void
  onTopic: (t: TopicId) => void
  onEssays: () => void
  onToggleUnverified: () => void
  onReset: () => void
}

export default function Home({ progress, pool, onQuick, onWeak, onTopic, onEssays, onToggleUnverified, onReset }: Props) {
  const { level, into, span } = levelProgress(progress.xp)
  const weak = weakSpots(pool, progress.cards).length
  const totalMastered = TOPICS.reduce((a, t) => a + topicMastery(pool, progress.cards, t.id).mastered, 0)

  return (
    <div className="home">
      <header className="hero">
        <div>
          <h1>Levrero Quest</h1>
          <p className="muted">Monetary economics: drill it until it sticks</p>
        </div>
        <div className="streak" title="Consecutive days played">🔥 {progress.dayStreak}</div>
      </header>

      <div className="card level">
        <div className="level-row">
          <strong>Level {level} · {titleFor(level)}</strong>
          <span className="muted">{progress.xp} XP</span>
        </div>
        <div className="progress"><div style={{ width: `${(into / span) * 100}%` }} /></div>
        <div className="muted small">{span - into} XP to level {level + 1} · {totalMastered}/{pool.length} questions mastered</div>
      </div>

      <div className="cta">
        <button className="primary big" onClick={onQuick}>⚡ Quick round (10)</button>
        <button className="big" onClick={onWeak} disabled={weak === 0}>
          🎯 Weak spots{weak > 0 ? ` (${weak})` : ''}
        </button>
      </div>

      <h2>Topics</h2>
      <div className="topics">
        {TOPICS.map((t) => {
          const m = topicMastery(pool, progress.cards, t.id)
          return (
            <button key={t.id} className="topic" onClick={() => onTopic(t.id)}>
              <div className="topic-head">
                <span className="emoji">{t.emoji}</span>
                <strong>{t.name}</strong>
              </div>
              <div className="muted small">{t.blurb}</div>
              <div className="progress thin"><div style={{ width: `${m.total ? (m.mastered / m.total) * 100 : 0}%` }} /></div>
              <div className="muted small">{m.mastered}/{m.total} mastered · {m.seen} seen</div>
            </button>
          )
        })}
      </div>

      <h2>Exam practice</h2>
      <button className="topic essay-entry" onClick={onEssays}>
        <div className="topic-head"><span className="emoji">✍️</span><strong>Mini-essays: the flagged exam questions</strong></div>
        <div className="muted small">Corridor, term structure, matrices, quantity theory, Sidrauski. Write your answer, then self-grade against the key points.</div>
      </button>

      <footer className="foot">
        <label>
          <input type="checkbox" checked={progress.hideUnverified} onChange={onToggleUnverified} /> Hide questions built from reconstructed notes
        </label>
        <button
          className="ghost danger"
          onClick={() => {
            if (window.confirm('Reset all progress (XP, mastery, essay drafts)?')) onReset()
          }}
        >
          Reset progress
        </button>
      </footer>
    </div>
  )
}
