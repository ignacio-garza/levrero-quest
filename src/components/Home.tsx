import type { Question, TopicId } from '../types'
import { TOPICS } from '../data/topics'
import { topicMastery, weakSpots } from '../game/scheduler'
import { parseBackup, type Progress } from '../game/store'
import { levelProgress, titleFor } from '../game/xp'

function downloadBackup(p: Progress) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(p)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `levrero-quest-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  progress: Progress
  pool: Question[]
  onQuick: () => void
  onWeak: () => void
  onTopic: (t: TopicId) => void
  onEssays: () => void
  onToggleUnverified: () => void
  onReset: () => void
  onRestore: (p: Progress) => void
}

export default function Home({ progress, pool, onQuick, onWeak, onTopic, onEssays, onToggleUnverified, onReset, onRestore }: Props) {
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
        <div className="muted small">
          {span - into} XP to level {level + 1} · {totalMastered}/{pool.length} questions mastered (4 correct in a row)
        </div>
      </div>

      <div className="cta">
        <button className="primary big" onClick={onQuick}>⚡ Quick round (10)</button>
        <button className="big" onClick={onWeak} disabled={weak === 0}>
          🎯 Weak spots{weak > 0 ? ` (${weak})` : ''}
        </button>
      </div>

      <p className="muted small">Rounds favour midterm material: final-only questions (from 10_20 on) come up 4× less often.</p>

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
              <div className="progress thin" role="progressbar" aria-label={`${t.name} progress`} aria-valuenow={Math.round(m.score * 100)}>
                <div style={{ width: `${m.score * 100}%` }} />
              </div>
              <div className="muted small">
                {Math.round(m.score * 100)}% · {m.seen}/{m.total} seen · {m.mastered} mastered
              </div>
            </button>
          )
        })}
      </div>

      <h2>Exam practice</h2>
      <button className="topic essay-entry" onClick={onEssays}>
        <div className="topic-head"><span className="emoji">✍️</span><strong>Mini-essays: the flagged exam questions</strong></div>
        <div className="muted small">Corridor, term structure, matrices, quantity theory, Tobin, Kaldor, Sidrauski. Write your answer, then self-grade against the key points.</div>
      </button>

      <footer className="foot">
        <label>
          <input type="checkbox" checked={progress.hideUnverified} onChange={onToggleUnverified} /> Hide questions built from reconstructed notes
        </label>
        <button className="ghost" onClick={() => downloadBackup(progress)}>💾 Back up progress</button>
        <label className="ghost file-btn">
          ⤴ Restore backup
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              const p = parseBackup(await file.text())
              if (!p) window.alert('That file is not a Levrero Quest backup.')
              else if (window.confirm('Replace your current progress with this backup?')) onRestore(p)
            }}
          />
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
