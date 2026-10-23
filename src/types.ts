export type TopicId =
  | 'money'
  | 'origin'
  | 'liquidity'
  | 'cb'
  | 'policy'
  | 'rates'
  | 'sfc'
  | 'qt'
  | 'endo'
  | 'longrun'
  | 'optimum'

interface Base {
  id: string
  topic: TopicId
  session: string
  /** false = built from reconstructed/garbled notes; check against slides */
  verified?: boolean
  explain?: string
}

/** options[0] is the correct answer; the UI shuffles. */
export interface MCQ extends Base {
  type: 'mc'
  q: string
  options: string[]
}

export interface TFQ extends Base {
  type: 'tf'
  q: string
  answer: boolean
}

export interface MatchQ extends Base {
  type: 'match'
  q: string
  pairs: [string, string][]
}

/** Numeric question whose numbers are drawn fresh each time (see game/generators.ts). */
export interface GenQ extends Base {
  type: 'gen'
  gen: string
}

export type Question = MCQ | TFQ | MatchQ | GenQ

export interface EssayCard {
  id: string
  title: string
  prompt: string
  quote: string
  where: string
  keyPoints: string[]
  /** topic not yet covered in class */
  pending?: boolean
  drill?: 'forward'
}
