import type { Question, TopicId } from '../types'
import type { CardState } from './store'
import type { Rng } from './generators'

export const MAX_BOX = 5
export const MASTERED_BOX = 4

/** Leitner-style weights: unseen and low boxes come up far more often than mastered cards. */
const BOX_WEIGHT = [3, 4, 3, 2, 1.2, 0.5]

export function weight(c?: CardState): number {
  if (!c || c.seen === 0) return BOX_WEIGHT[0]
  return BOX_WEIGHT[Math.min(c.box, MAX_BOX)]
}

export function applyAnswer(c: CardState | undefined, correct: boolean): CardState {
  const prev = c ?? { box: 0, seen: 0, correct: 0, wrong: 0 }
  return {
    box: correct ? Math.min(prev.box + 1, MAX_BOX) : 1,
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
  }
}

export const isMastered = (c?: CardState) => !!c && c.box >= MASTERED_BOX

/** Weighted sampling without replacement. */
export function pickRound(
  pool: Question[],
  cards: Record<string, CardState>,
  size = 10,
  rng: Rng = Math.random,
): Question[] {
  const left = [...pool]
  const out: Question[] = []
  while (out.length < size && left.length) {
    const ws = left.map((q) => weight(cards[q.id]))
    let t = rng() * ws.reduce((a, b) => a + b, 0)
    let idx = 0
    for (; idx < ws.length - 1; idx++) {
      t -= ws[idx]
      if (t <= 0) break
    }
    out.push(left.splice(idx, 1)[0])
  }
  return out
}

export function weakSpots(pool: Question[], cards: Record<string, CardState>): Question[] {
  return pool.filter((q) => {
    const c = cards[q.id]
    return c && c.seen > 0 && c.box <= 2
  })
}

export function topicMastery(pool: Question[], cards: Record<string, CardState>, topic: TopicId) {
  const qs = pool.filter((q) => q.topic === topic)
  const mastered = qs.filter((q) => isMastered(cards[q.id])).length
  const seen = qs.filter((q) => (cards[q.id]?.seen ?? 0) > 0).length
  // Partial credit for every box climbed, so the bar moves after each round, not only on mastery.
  const climbed = qs.reduce((a, q) => a + Math.min(cards[q.id]?.box ?? 0, MASTERED_BOX), 0)
  const score = qs.length ? climbed / (qs.length * MASTERED_BOX) : 0
  return { total: qs.length, mastered, seen, score }
}
