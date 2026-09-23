import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import App from './App'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('SpendLens product workflow', () => {
  it('opens on a monthly change brief with explainable findings', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Your July money brief/i })).toBeInTheDocument()
    expect(screen.getByText(/What changed/i)).toBeInTheDocument()
    expect(screen.getByText(/Recurring watch/i)).toBeInTheDocument()
    expect(screen.getByText(/Fresh Mart/i)).toBeInTheDocument()
  })

  it('opens the contributing transaction from an anomaly finding', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Review Fresh Mart spike/i }))
    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument()
    expect(screen.getByText('FRESH MART #4482')).toBeInTheDocument()
  })

  it('blocks a malformed import at the review gate', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Import statement' }))
    const file = new File(['Date,Description,Amount\n03/04/2026,Coffee,-4.50'], 'ambiguous.csv', { type: 'text/csv' })
    fireEvent.change(screen.getByLabelText('Choose CSV statement'), { target: { files: [file] } })
    await waitFor(() => expect(screen.getAllByText(/Ambiguous date/i).length).toBeGreaterThan(0))
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeDisabled()
  })
})
