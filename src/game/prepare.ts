import type { Question } from '../types'
import { GENERATORS, type Rng } from './generators'

export type Prepared =
  | { kind: 'mc'; q: Question; text: string; options: string[]; correct: number; explain: string }
  | { kind: 'tf'; q: Question; text: string; correct: boolean; explain: string }
  | { kind: 'match'; q: Question; text: string; left: string[]; right: string[]; solution: number[]; explain: string }
  | { kind: 'num'; q: Question; text: string; answer: number; tolerance: number; unit?: string; explain: string }

export function shuffle<T>(xs: T[], rng: Rng = Math.random): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function prepare(q: Question, rng: Rng = Math.random): Prepared {
  const explain = q.explain ?? ''
  switch (q.type) {
    case 'mc': {
      const options = shuffle(q.options, rng)
      return { kind: 'mc', q, text: q.q, options, correct: options.indexOf(q.options[0]), explain }
    }
    case 'tf':
      return { kind: 'tf', q, text: q.q, correct: q.answer, explain }
    case 'match': {
      const left = q.pairs.map((p) => p[0])
      const rightOrig = q.pairs.map((p) => p[1])
      const right = shuffle(rightOrig, rng)
      return { kind: 'match', q, text: q.q, left, right, solution: rightOrig.map((r) => right.indexOf(r)), explain }
    }
    case 'gen': {
      const g = GENERATORS[q.gen](rng)
      return { kind: 'num', q, text: g.q, answer: g.answer, tolerance: g.tolerance, unit: g.unit, explain: g.explain }
    }
  }
}

export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[%\s]/g, '').replace(',', '.')
  if (cleaned === '' || !/^-?\d*\.?\d+$/.test(cleaned)) return null
  return Number(cleaned)
}

export function gradeNumber(p: { answer: number; tolerance: number }, input: string): boolean {
  const n = parseNumber(input)
  return n !== null && Math.abs(n - p.answer) <= p.tolerance + 1e-9
}
