import type { TopicId } from '../types'

export interface Topic {
  id: TopicId
  name: string
  emoji: string
  blurb: string
}

export const TOPICS: Topic[] = [
  { id: 'money', name: 'What is money', emoji: '🪙', blurb: 'Functions, chartalism, inside vs outside money, who says what' },
  { id: 'origin', name: 'Origins & unit of account', emoji: '📜', blurb: 'Smith vs credit view, tallies, seigniorage, numéraire' },
  { id: 'liquidity', name: 'Liquidity & aggregates', emoji: '💧', blurb: 'M0–M5, repos, collateral, haircuts' },
  { id: 'cb', name: 'Central banks & base money', emoji: '🏛️', blurb: 'Goals, MB, three channels, Art. 123, reserves' },
  { id: 'policy', name: 'Operations & rate systems', emoji: '⚙️', blurb: 'Facilities, tenders, corridor, floor, 1970s vs today' },
  { id: 'rates', name: 'Rates & term structure', emoji: '📈', blurb: 'Fisher, expectations, Meiselman, Hicks, Keynes vs natural rate' },
  { id: 'sfc', name: 'Stock–flow accounting', emoji: '🧮', blurb: 'Stocks, flows, sectoral balances, SFC' },
  { id: 'qt', name: 'Quantity theory & money demand', emoji: '🔢', blurb: 'MV = PT, Cambridge, Friedman, Baumol, Tobin, exam scope' },
  { id: 'endo', name: 'Money supply & endogeneity', emoji: '🏦', blurb: 'Multiplier, rates in the multiplier, accommodation, Kaldor, horizontalists vs structuralists' },
  { id: 'longrun', name: 'Neoclassical long run & Sidrauski', emoji: '⏳', blurb: 'Loanable funds, natural rate, dichotomy, Sidrauski conditions, super-neutrality · final only' },
  { id: 'optimum', name: 'Optimum money & OLG', emoji: '🎯', blurb: 'Existence and stability, Friedman rule and deflation, Phelps, Samuelson OLG · final only' },
]

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, Topic>
