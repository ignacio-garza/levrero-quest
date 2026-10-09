export type Rng = () => number

export interface GenResult {
  q: string
  answer: number
  tolerance: number
  unit?: string
  explain: string
}

const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1))
const pick = <T,>(r: Rng, xs: T[]): T => xs[Math.floor(r() * xs.length)]
const round2 = (x: number) => Math.round(x * 100) / 100

export const GENERATORS: Record<string, (r: Rng) => GenResult> = {
  fisher(r) {
    const i = int(r, 3, 9)
    const pe = int(r, 1, 4)
    const exact = ((1 + i / 100) / (1 + pe / 100) - 1) * 100
    return {
      q: `Nominal rate is ${i}% and expected inflation is ${pe}%. What is the real rate (approximation i ≈ r + π^e)?`,
      answer: i - pe,
      tolerance: 0.15,
      unit: '%',
      explain: `r ≈ i − π^e = ${i} − ${pe} = ${i - pe}% (exactly ${round2(exact)}%, since (1+i) = (1+r)(1+π^e)).`,
    }
  },

  fisherInflation(r) {
    const pe = int(r, 1, 4)
    const real = int(r, 1, 4)
    return {
      q: `Real rate is ${real}% and the nominal rate is ${real + pe}%. What inflation is expected (approximately)?`,
      answer: pe,
      tolerance: 0.15,
      unit: '%',
      explain: `π^e ≈ i − r = ${real + pe} − ${real} = ${pe}%.`,
    }
  },

  avgShortRates(r) {
    const a = int(r, 1, 6)
    const b = int(r, 1, 6)
    const c = int(r, 1, 6)
    const avg = round2((a + b + c) / 3)
    return {
      q: `Pure expectations theory, no premium. Expected one-year rates over 3 years are ${a}%, ${b}%, ${c}%. What is the 3-year long rate (approximately)?`,
      answer: avg,
      tolerance: 0.05,
      unit: '%',
      explain: `R ≈ (1/n)·Σ rᵢ = (${a} + ${b} + ${c})/3 = ${avg}%.`,
    }
  },

  liquidityPremium(r) {
    const a = int(r, 1, 5)
    const b = a + 2 * int(r, 0, 2)
    const L = pick(r, [0.5, 1, 1.5])
    const R = (a + b) / 2 + L
    return {
      q: `Liquidity premium theory (Hicks). Expected short rates over 2 years: ${a}% and ${b}%. The liquidity premium is ${L}%. What is the 2-year long rate (approximately)?`,
      answer: R,
      tolerance: 0.05,
      unit: '%',
      explain: `R ≈ avg(expected short rates) + L = ${(a + b) / 2} + ${L} = ${R}%.`,
    }
  },

  velocity(r) {
    const M = pick(r, [50, 100, 200, 500])
    const V = int(r, 2, 6)
    return {
      q: `Money stock M = ${M} and total monetary expenditure PT = ${M * V}. What is the velocity V in MV = PT?`,
      answer: V,
      tolerance: 0.01,
      explain: `V = PT / M = ${M * V} / ${M} = ${V}. The equation of exchange is an identity.`,
    }
  },

  cambridgeDemand(r) {
    const k = pick(r, [0.1, 0.2, 0.25, 0.5])
    const P = pick(r, [1, 2, 4])
    const Y = pick(r, [100, 200, 400, 1000])
    const Md = k * P * Y
    return {
      q: `Cambridge version: k = ${k}, price level P = ${P}, real income Y = ${Y}. What is nominal money demand M_d?`,
      answer: Md,
      tolerance: 0.01,
      explain: `M_d = k·P·Y = ${k} × ${P} × ${Y} = ${Md}. (k = 1/V, so here V = ${round2(1 / k)}.)`,
    }
  },

  newPriceLevel(r) {
    const M0 = pick(r, [100, 200])
    const f = pick(r, [1.5, 2, 3])
    const P0 = pick(r, [1, 2, 4])
    return {
      q: `Quantity theory (V and T given). Money supply rises from ${M0} to ${M0 * f}; the price level was ${P0}. What is the new price level once the money market clears?`,
      answer: P0 * f,
      tolerance: 0.01,
      explain: `P adjusts in proportion to M: ${P0} × ${f} = ${P0 * f}. The price level ensures money market equilibrium.`,
    }
  },

  numPrices(r) {
    const n = int(r, 4, 10)
    if (r() < 0.5) {
      return {
        q: `An economy has ${n} goods and no common unit. How many relative prices must be known (one per pair)?`,
        answer: (n * (n - 1)) / 2,
        tolerance: 0.01,
        explain: `n(n−1)/2 = ${n}·${n - 1}/2 = ${(n * (n - 1)) / 2}.`,
      }
    }
    return {
      q: `An economy has ${n} goods and all prices are expressed in a numéraire. How many prices must be known?`,
      answer: n - 1,
      tolerance: 0.01,
      explain: `n − 1 = ${n - 1}.`,
    }
  },

  haircut(r) {
    const v = pick(r, [100, 200, 500])
    const h = pick(r, [10, 20, 25])
    const loan = (v * (100 - h)) / 100
    return {
      q: `A central bank applies a ${h}% haircut to a bond worth ${v}. How much does it lend against it?`,
      answer: loan,
      tolerance: 0.01,
      explain: `${v} × (1 − ${h}%) = ${loan}. The margin of ${v - loan} protects the lender.`,
    }
  },

  sectoral(r) {
    const I = int(r, 10, 30)
    const G = int(r, 20, 40)
    const T = int(r, 15, 35)
    const X = int(r, 10, 30)
    const M = int(r, 10, 30)
    const S = I + (G - T) + (X - M)
    return {
      q: `Sectoral balances: I = ${I}, G = ${G}, T = ${T}, X = ${X}, M = ${M}. What is private saving S, given (S − I) = (G − T) + (X − M)?`,
      answer: S,
      tolerance: 0.01,
      explain: `S = I + (G − T) + (X − M) = ${I} + ${G - T} + ${X - M} = ${S}. An ex post identity, not a causal relationship.`,
    }
  },
}
