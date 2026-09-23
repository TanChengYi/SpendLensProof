import { describe, expect, it } from 'vitest'
import { analyzeSpending } from './analysis'
import { categorize, normalizeMerchant } from './categorization'
import type { Transaction } from './types'

const transaction = (id: string, date: string, description: string, amount: number, category: Transaction['category'] = 'Other'): Transaction => ({
  id,
  date,
  description,
  merchant: normalizeMerchant(description),
  amount,
  currency: 'USD',
  category,
  account: 'Checking',
})

describe('explainable spending analysis', () => {
  it('normalizes noisy merchants and applies visible ordered rules', () => {
    expect(normalizeMerchant('SQ *NORTHSTAR COFFEE 4821')).toBe('Northstar Coffee')
    expect(normalizeMerchant('NORTH ELECTRIC')).toBe('North Electric')
    expect(categorize('TST* GREEN TABLE 0182')).toBe('Dining')
    expect(categorize('PAYROLL ACME INC')).toBe('Income')
  })

  it('explains the latest month change with linked category evidence', () => {
    const values = [
      transaction('jun-food', '2026-06-10', 'GREEN TABLE', -5000, 'Dining'),
      transaction('jun-home', '2026-06-11', 'CITY RENT', -100000, 'Housing'),
      transaction('jul-food', '2026-07-10', 'GREEN TABLE', -9000, 'Dining'),
      transaction('jul-home', '2026-07-11', 'CITY RENT', -100000, 'Housing'),
    ]

    const result = analyzeSpending(values)

    expect(result.currentMonth).toBe('2026-07')
    expect(result.previousMonth).toBe('2026-06')
    expect(result.expenseChange).toBe(4000)
    expect(result.categoryDeltas[0]).toMatchObject({ category: 'Dining', change: 4000, transactionIds: ['jul-food'] })
  })

  it('detects a stable monthly subscription and reports its evidence', () => {
    const values = [
      transaction('s1', '2026-05-02', 'STREAMBOX', -1599, 'Subscriptions'),
      transaction('s2', '2026-06-02', 'STREAMBOX', -1599, 'Subscriptions'),
      transaction('s3', '2026-07-02', 'STREAMBOX', -1699, 'Subscriptions'),
    ]

    const [finding] = analyzeSpending(values).recurring
    expect(finding).toMatchObject({ merchant: 'Streambox', cadence: 'monthly', transactionIds: ['s1', 's2', 's3'] })
    expect(finding?.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('flags a material merchant spike against its own robust baseline', () => {
    const values = [
      transaction('g1', '2026-04-04', 'FRESH MART', -5200, 'Groceries'),
      transaction('g2', '2026-05-04', 'FRESH MART', -4800, 'Groceries'),
      transaction('g3', '2026-06-04', 'FRESH MART', -5000, 'Groceries'),
      transaction('g4', '2026-07-04', 'FRESH MART', -18200, 'Groceries'),
    ]

    const [finding] = analyzeSpending(values).anomalies
    expect(finding).toMatchObject({ transactionId: 'g4', merchant: 'Fresh Mart', baseline: 5000, amount: 18200 })
    expect(finding?.explanation).toContain('usual')
  })
})
