// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('App smoke test', () => {
  it('plays a full quick round and awards XP', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Levrero Quest' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Quick round/ }))

    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`${i + 1} / 10`)).toBeTruthy()
      // answer whatever the type is, usually wrongly or rightly: we only care the flow completes
      const opts = document.querySelectorAll<HTMLButtonElement>('.options button')
      if (opts.length) {
        await user.click(opts[0])
      } else if (document.querySelector('.match')) {
        const selects = document.querySelectorAll<HTMLSelectElement>('.match select')
        for (const s of selects) await user.selectOptions(s, '0')
        await user.click(screen.getByRole('button', { name: 'Check' }))
      } else {
        await user.type(screen.getByLabelText('Your numeric answer'), '1')
        await user.click(screen.getByRole('button', { name: 'Check' }))
      }
      await user.click(screen.getByRole('button', { name: /Next|See results/ }))
    }

    expect(screen.getByText(/correct$/)).toBeTruthy()
    const saved = JSON.parse(localStorage.getItem('levrero-game-v1')!)
    expect(Object.keys(saved.cards).length).toBe(10)
    expect(saved.rounds).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Home' }))
    expect(screen.getByRole('heading', { name: 'Levrero Quest' })).toBeTruthy()
  })

  it('opens a topic round and the essay practice, saving a draft and a score', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Mini-essays/ }))
    await user.click(screen.getByRole('button', { name: /Explain the corridor system/ }))

    await user.type(screen.getByPlaceholderText(/Write your answer/), 'ceiling floor arbitrage')
    await user.click(screen.getByRole('button', { name: 'Reveal key points' }))
    const boxes = within(document.querySelector('.checklist') as HTMLElement).getAllByRole('checkbox')
    await user.click(boxes[0])
    await user.click(boxes[2])
    await user.click(screen.getByRole('button', { name: 'Save score' }))

    const saved = JSON.parse(localStorage.getItem('levrero-game-v1')!)
    expect(saved.essays.corridor.draft).toBe('ceiling floor arbitrage')
    expect(saved.essays.corridor.lastScore).toBe(2)
    expect(saved.essays.corridor.attempts).toBe(1)
  })

  it('shows the forward-rate drill and grades a correct answer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Mini-essays/ }))
    await user.click(screen.getByRole('button', { name: /forward rates/ }))
    const input = screen.getByLabelText('Forward rate in percent')
    await user.type(input, '0')
    await user.click(screen.getAllByRole('button', { name: 'Check' })[0])
    expect(screen.getByText(/r_n ≈/)).toBeTruthy()
  })
})
