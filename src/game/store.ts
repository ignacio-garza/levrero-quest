const KEY = 'levrero-game-v1'

export interface CardState {
  box: number
  seen: number
  correct: number
  wrong: number
}

export interface EssayState {
  draft: string
  attempts: number
  lastScore?: number
  lastTotal?: number
}

export interface Progress {
  xp: number
  rounds: number
  cards: Record<string, CardState>
  essays: Record<string, EssayState>
  dayStreak: number
  lastDay: string
  hideUnverified: boolean
}

export const emptyProgress = (): Progress => ({
  xp: 0,
  rounds: 0,
  cards: {},
  essays: {},
  dayStreak: 0,
  lastDay: '',
  hideUnverified: false,
})

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    return { ...emptyProgress(), ...JSON.parse(raw) }
  } catch {
    return emptyProgress()
  }
}

export function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage unavailable (private window etc.): the game still works, progress just isn't kept
  }
}

export function reset(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

/** Updates the consecutive-days counter when a round is played. */
export function touchDay(p: Progress, now = new Date()): Progress {
  const today = dayKey(now)
  if (p.lastDay === today) return p
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const streak = p.lastDay === dayKey(yesterday) ? p.dayStreak + 1 : 1
  return { ...p, dayStreak: streak, lastDay: today }
}
