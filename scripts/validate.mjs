// Validates the question bank and essay cards before every build.
import { readFileSync } from 'node:fs'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const questions = read('../src/data/questions.json')
const essays = read('../src/data/essays.json')

const TOPICS = ['money', 'origin', 'liquidity', 'cb', 'policy', 'rates', 'sfc', 'qt', 'endo', 'longrun', 'optimum']
const SESSIONS = ['09_29', '10_01', '10_02', '10_06', '10_08', '10_09', '10_13', '10_15', '10_16', '10_20', '10_22', '10_23']
const GENS = [
  'fisher', 'fisherInflation', 'avgShortRates', 'liquidityPremium', 'velocity',
  'cambridgeDemand', 'newPriceLevel', 'numPrices', 'haircut', 'sectoral', 'friedmanRule',
]

const errors = []
const err = (id, msg) => errors.push(`${id}: ${msg}`)
const ids = new Set()

for (const q of questions) {
  if (!q.id) err('?', 'missing id')
  if (ids.has(q.id)) err(q.id, 'duplicate id')
  ids.add(q.id)
  if (!TOPICS.includes(q.topic)) err(q.id, `unknown topic ${q.topic}`)
  if (!SESSIONS.includes(q.session)) err(q.id, `unknown session ${q.session}`)
  switch (q.type) {
    case 'mc':
      if (!q.q) err(q.id, 'missing q')
      if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) err(q.id, 'needs 3-5 options')
      else if (new Set(q.options).size !== q.options.length) err(q.id, 'duplicate options')
      break
    case 'tf':
      if (typeof q.answer !== 'boolean') err(q.id, 'tf needs boolean answer')
      break
    case 'match':
      if (!Array.isArray(q.pairs) || q.pairs.length < 2) err(q.id, 'match needs >= 2 pairs')
      else {
        if (new Set(q.pairs.map((p) => p[0])).size !== q.pairs.length) err(q.id, 'duplicate left items')
        if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) err(q.id, 'duplicate right items')
      }
      break
    case 'gen':
      if (!GENS.includes(q.gen)) err(q.id, `unknown generator ${q.gen}`)
      break
    default:
      err(q.id, `unknown type ${q.type}`)
  }
  if (q.type !== 'gen' && !q.explain) err(q.id, 'missing explain')
}

const essayIds = new Set()
for (const e of essays) {
  if (essayIds.has(e.id)) err(e.id, 'duplicate essay id')
  essayIds.add(e.id)
  for (const k of ['title', 'prompt', 'quote', 'where']) if (!e[k]) err(e.id, `missing ${k}`)
  if (!Array.isArray(e.keyPoints) || e.keyPoints.length < 3) err(e.id, 'needs >= 3 key points')
}

if (errors.length) {
  console.error(`Validation failed (${errors.length}):\n- ` + errors.join('\n- '))
  process.exit(1)
}

const byTopic = TOPICS.map((t) => `${t}:${questions.filter((q) => q.topic === t).length}`).join('  ')
console.log(`OK: ${questions.length} questions (${byTopic}), ${essays.length} essay cards`)
