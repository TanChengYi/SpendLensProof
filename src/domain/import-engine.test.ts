import { describe, expect, it } from 'vitest'
import { inferMapping, reviewCsv } from './import-engine'

describe('statement import review', () => {
  it('infers common bank headers without guessing an amount sign', () => {
    expect(inferMapping(['Transaction Date', 'Narrative', 'Debit', 'Credit'])).toMatchObject({
      date: 'Transaction Date',
      description: 'Narrative',
      debit: 'Debit',
      credit: 'Credit',
    })
  })

  it('normalizes debit and credit columns into signed minor units', () => {
    const csv = [
      'Date,Description,Debit,Credit',
      '2026-07-01,Corner Market,12.45,',
      '2026-07-02,Salary,,2500.00',
    ].join('\n')

    const review = reviewCsv(csv, { date: 'Date', description: 'Description', debit: 'Debit', credit: 'Credit', dateOrder: 'ymd' })

    expect(review.canCommit).toBe(true)
    expect(review.transactions.map((item) => item.amount)).toEqual([-1245, 250000])
    expect(review.summary).toMatchObject({ validRows: 2, rejectedRows: 0, expenses: 1245, income: 250000 })
  })

  it('rejects ambiguous dates and duplicate rows instead of silently changing totals', () => {
    const csv = [
      'Date,Description,Amount',
      '03/04/2026,Coffee,-4.50',
      '2026-07-02,Rent,-1200.00',
      '2026-07-02,Rent,-1200.00',
    ].join('\n')

    const review = reviewCsv(csv, { date: 'Date', description: 'Description', amount: 'Amount', dateOrder: 'auto' })

    expect(review.transactions).toHaveLength(1)
    expect(review.rejected[0]?.reason).toContain('Ambiguous date')
    expect(review.duplicates).toHaveLength(1)
    expect(review.summary.expenses).toBe(120000)
  })

  it('blocks commit when required mappings are missing', () => {
    const review = reviewCsv('When,What\n2026-07-01,Coffee', { date: 'When', description: 'What', dateOrder: 'ymd' })
    expect(review.canCommit).toBe(false)
    expect(review.errors).toContain('Choose an amount column or both debit and credit columns.')
  })
})
