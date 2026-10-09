/** Level n starts at 50·(n−1)² XP. */
export const xpForLevel = (level: number) => 50 * (level - 1) ** 2

export function levelFor(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function levelProgress(xp: number) {
  const level = levelFor(xp)
  const from = xpForLevel(level)
  const to = xpForLevel(level + 1)
  return { level, into: xp - from, span: to - from }
}

export const LEVEL_TITLES = [
  'Barterer',
  'Tally keeper',
  'Mint apprentice',
  'Chartalist',
  'Bank clerk',
  'Reserve manager',
  'Corridor walker',
  'Yield curve reader',
  'Governor',
  'Lender of last resort',
]

export const titleFor = (level: number) => LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]

/** 10 XP per correct answer, plus +2 per combo step (capped at 5). */
export const xpForAnswer = (combo: number) => 10 + Math.min(combo, 5) * 2
