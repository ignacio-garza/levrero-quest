import type { EssayCard, Question } from '../types'
import questions from './questions.json'
import essays from './essays.json'

export const QUESTIONS = questions as unknown as Question[]
export const ESSAYS = essays as unknown as EssayCard[]
