import type { Rng } from './generators'

export interface ForwardDrill {
  n: number
  Rn: number
  Rn1: number
  answer: number
  explain: string
}

/** Forward short rate for year n implied by n-year and (n−1)-year rates (annual, in %). */
export function forwardRate(n: number, Rn: number, Rn1: number): number {
  return ((Math.pow(1 + Rn / 100, n) / Math.pow(1 + Rn1 / 100, n - 1)) - 1) * 100
}

export function makeForwardDrill(rng: Rng = Math.random): ForwardDrill {
  const n = 2 + Math.floor(rng() * 4)
  const Rn1 = 2 + Math.floor(rng() * 4)
  const Rn = Rn1 + (1 + Math.floor(rng() * 3)) / 2
  const answer = Math.round(forwardRate(n, Rn, Rn1) * 100) / 100
  const explain = `1 + r_n = (1 + R_n)^n / (1 + R_{n−1})^{n−1} = (1 + ${Rn}%)^${n} / (1 + ${Rn1}%)^${n - 1} → r_n ≈ ${answer}%`
  return { n, Rn, Rn1, answer, explain }
}
