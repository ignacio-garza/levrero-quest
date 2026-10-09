import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data'
import { GENERATORS } from './generators'
import { forwardRate, makeForwardDrill } from './forward'
import { applyAnswer, pickRound, weakSpots } from './scheduler'
import { gradeNumber, parseNumber, prepare } from './prepare'
import { touchDay, emptyProgress } from './store'
import { levelFor, xpForLevel } from './xp'

// deterministic rng
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

describe('scheduler', () => {
  it('moves up on correct, resets to box 1 on wrong', () => {
    let c = applyAnswer(undefined, true)
    expect(c.box).toBe(1)
    c = applyAnswer(c, true)
    c = applyAnswer(c, true)
    expect(c.box).toBe(3)
    c = applyAnswer(c, false)
    expect(c.box).toBe(1)
    expect(c.wrong).toBe(1)
  })

  it('caps the box at 5', () => {
    let c = undefined as ReturnType<typeof applyAnswer> | undefined
    for (let i = 0; i < 10; i++) c = applyAnswer(c, true)
    expect(c!.box).toBe(5)
  })

  it('picks unique questions and favours weak ones', () => {
    const cards = Object.fromEntries(QUESTIONS.map((q) => [q.id, { box: 5, seen: 3, correct: 3, wrong: 0 }]))
    const weak = QUESTIONS[0].id
    cards[weak] = { box: 1, seen: 1, correct: 0, wrong: 1 }
    const rng = seeded(1)
    const control = QUESTIONS[1].id
    let hits = 0
    let controlHits = 0
    for (let i = 0; i < 400; i++) {
      const round = pickRound(QUESTIONS, cards, 10, rng)
      expect(new Set(round.map((q) => q.id)).size).toBe(round.length)
      if (round.some((q) => q.id === weak)) hits++
      if (round.some((q) => q.id === control)) controlHits++
    }
    // a box-1 card should appear several times more often than a mastered one
    expect(hits).toBeGreaterThan(controlHits * 4)
    expect(weakSpots(QUESTIONS, cards).map((q) => q.id)).toEqual([weak])
  })
})

describe('generators', () => {
  it('produce answers consistent with their explanations for many seeds', () => {
    for (const [name, g] of Object.entries(GENERATORS)) {
      for (let s = 1; s <= 50; s++) {
        const r = g(seeded(s))
        expect(Number.isFinite(r.answer), name).toBe(true)
        expect(r.q.length, name).toBeGreaterThan(10)
        expect(gradeNumber(r, String(r.answer))).toBe(true)
      }
    }
  })

  it('every gen question references an existing generator', () => {
    for (const q of QUESTIONS.filter((x) => x.type === 'gen')) {
      expect(GENERATORS[(q as { gen: string }).gen], q.id).toBeTypeOf('function')
    }
  })
})

describe('prepare', () => {
  it('tracks the correct mc option after shuffling', () => {
    for (const q of QUESTIONS.filter((x) => x.type === 'mc')) {
      const p = prepare(q, seeded(7))
      if (p.kind !== 'mc' || q.type !== 'mc') throw new Error('kind')
      expect(p.options[p.correct]).toBe(q.options[0])
    }
  })

  it('match solutions map each left item to its right item', () => {
    for (const q of QUESTIONS.filter((x) => x.type === 'match')) {
      const p = prepare(q, seeded(3))
      if (p.kind !== 'match' || q.type !== 'match') throw new Error('kind')
      p.left.forEach((l, i) => {
        const pair = q.pairs.find((x) => x[0] === l)!
        expect(p.right[p.solution[i]]).toBe(pair[1])
      })
    }
  })

  it('parses numbers with % and decimal commas', () => {
    expect(parseNumber('4,5 %')).toBe(4.5)
    expect(parseNumber('-2')).toBe(-2)
    expect(parseNumber('abc')).toBeNull()
  })
})

describe('forward-rate drill', () => {
  it('matches the 6% / 5% worked example', () => {
    // n = 2: (1.06)^2 / 1.05 − 1 ≈ 7.01%
    expect(forwardRate(2, 6, 5)).toBeCloseTo(7.01, 2)
  })

  it('rolling over short rates reproduces the long rate', () => {
    const d = makeForwardDrill(seeded(5))
    const lhs = Math.pow(1 + d.Rn / 100, d.n)
    const rhs = Math.pow(1 + d.Rn1 / 100, d.n - 1) * (1 + forwardRate(d.n, d.Rn, d.Rn1) / 100)
    expect(lhs).toBeCloseTo(rhs, 10)
  })
})

describe('xp and streak', () => {
  it('levels line up with thresholds', () => {
    expect(levelFor(0)).toBe(1)
    expect(levelFor(xpForLevel(3))).toBe(3)
    expect(levelFor(xpForLevel(3) - 1)).toBe(2)
  })

  it('counts consecutive days', () => {
    let p = touchDay(emptyProgress(), new Date(2026, 9, 9))
    expect(p.dayStreak).toBe(1)
    p = touchDay(p, new Date(2026, 9, 9))
    expect(p.dayStreak).toBe(1)
    p = touchDay(p, new Date(2026, 9, 10))
    expect(p.dayStreak).toBe(2)
    p = touchDay(p, new Date(2026, 9, 13))
    expect(p.dayStreak).toBe(1)
  })
})
