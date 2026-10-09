import { useCallback, useMemo, useState } from 'react'
import { ESSAYS, QUESTIONS } from './data'
import type { Question, TopicId } from './types'
import { applyAnswer, pickRound, weakSpots } from './game/scheduler'
import { load, reset, save, touchDay, type Progress } from './game/store'
import Home from './components/Home'
import Results from './components/Results'
import Round, { type RoundSummary } from './components/Round'
import { EssayList, EssayView } from './components/Essays'
import { TOPIC_BY_ID } from './data/topics'

type Source = { kind: 'mixed' } | { kind: 'weak' } | { kind: 'topic'; id: TopicId }

type Screen =
  | { name: 'home' }
  | { name: 'round'; title: string; source: Source; questions: Question[]; run: number }
  | { name: 'results'; title: string; source: Source; summary: RoundSummary }
  | { name: 'essays' }
  | { name: 'essay'; id: string }

const ROUND_SIZE = 10

export default function App() {
  const [progress, setProgress] = useState<Progress>(load)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const pool = useMemo(
    () => (progress.hideUnverified ? QUESTIONS.filter((q) => q.verified !== false) : QUESTIONS),
    [progress.hideUnverified],
  )

  const start = (source: Source) => {
    let candidates = pool
    let title = 'Quick round'
    if (source.kind === 'topic') {
      candidates = pool.filter((q) => q.topic === source.id)
      title = TOPIC_BY_ID[source.id].name
    } else if (source.kind === 'weak') {
      candidates = weakSpots(pool, progress.cards)
      title = 'Weak spots'
    }
    const questions = pickRound(candidates, progress.cards, ROUND_SIZE)
    if (questions.length === 0) return
    update((p) => touchDay({ ...p, rounds: p.rounds + 1 }))
    setScreen({ name: 'round', title, source, questions, run: Date.now() })
  }

  const onAnswer = (id: string, correct: boolean, xp: number) =>
    update((p) => ({ ...p, xp: p.xp + xp, cards: { ...p.cards, [id]: applyAnswer(p.cards[id], correct) } }))

  if (screen.name === 'round') {
    return (
      <main>
        <Round
          key={screen.run}
          title={screen.title}
          questions={screen.questions}
          onAnswer={onAnswer}
          onFinish={(summary) => setScreen({ name: 'results', title: screen.title, source: screen.source, summary })}
          onQuit={() => setScreen({ name: 'home' })}
        />
      </main>
    )
  }

  if (screen.name === 'results') {
    const { source } = screen
    return (
      <main>
        <Results title={screen.title} summary={screen.summary} onAgain={() => start(source)} onHome={() => setScreen({ name: 'home' })} />
      </main>
    )
  }

  if (screen.name === 'essays') {
    return (
      <main>
        <EssayList progress={progress} onOpen={(id) => setScreen({ name: 'essay', id })} onBack={() => setScreen({ name: 'home' })} />
      </main>
    )
  }

  if (screen.name === 'essay') {
    const card = ESSAYS.find((e) => e.id === screen.id)!
    const state = progress.essays[card.id]
    const patch = (s: Partial<NonNullable<typeof state>>) =>
      update((p) => {
        const cur = p.essays[card.id] ?? { draft: '', attempts: 0 }
        return { ...p, essays: { ...p.essays, [card.id]: { ...cur, ...s } } }
      })
    return (
      <main>
        <EssayView
          key={card.id}
          card={card}
          state={state}
          onDraft={(draft) => patch({ draft })}
          onScore={(lastScore, lastTotal) =>
            update((p) => {
              const cur = p.essays[card.id] ?? { draft: '', attempts: 0 }
              return { ...p, essays: { ...p.essays, [card.id]: { ...cur, lastScore, lastTotal, attempts: cur.attempts + 1 } } }
            })
          }
          onBack={() => setScreen({ name: 'essays' })}
        />
      </main>
    )
  }

  return (
    <main>
      <Home
        progress={progress}
        pool={pool}
        onQuick={() => start({ kind: 'mixed' })}
        onWeak={() => start({ kind: 'weak' })}
        onTopic={(id) => start({ kind: 'topic', id })}
        onEssays={() => setScreen({ name: 'essays' })}
        onToggleUnverified={() => update((p) => ({ ...p, hideUnverified: !p.hideUnverified }))}
        onReset={() => {
          reset()
          update(() => load())
        }}
      />
    </main>
  )
}
