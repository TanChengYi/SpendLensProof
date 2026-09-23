import Papa from 'papaparse'
import { categorize, normalizeMerchant } from './categorization'
import type { ColumnMapping, DateOrder, ImportReview, Transaction } from './types'

const aliases = {
  date: ['date', 'transaction date', 'posted date', 'posting date', 'when'],
  description: ['description', 'narrative', 'merchant', 'details', 'memo', 'what'],
  amount: ['amount', 'transaction amount', 'value'],
  debit: ['debit', 'withdrawal', 'money out', 'paid out'],
  credit: ['credit', 'deposit', 'money in', 'paid in'],
  account: ['account', 'account name', 'card'],
} as const

const headerFor = (headers: string[], choices: readonly string[]) => headers.find((header) => choices.includes(header.trim().toLocaleLowerCase('en-US')))

export function inferMapping(headers: string[]): ColumnMapping {
  return {
    date: headerFor(headers, aliases.date),
    description: headerFor(headers, aliases.description),
    amount: headerFor(headers, aliases.amount),
    debit: headerFor(headers, aliases.debit),
    credit: headerFor(headers, aliases.credit),
    account: headerFor(headers, aliases.account),
    dateOrder: 'auto',
  }
}

function validIso(year: number, month: number, day: number): string | null {
  const value = new Date(Date.UTC(year, month - 1, day))
  if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) return null
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDate(raw: string, order: DateOrder): { date?: string; reason?: string } {
  const value = raw.trim()
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (iso) return { date: validIso(Number(iso[1]), Number(iso[2]), Number(iso[3])) ?? undefined, reason: validIso(Number(iso[1]), Number(iso[2]), Number(iso[3])) ? undefined : 'Invalid date' }
  const parts = /^(\d{1,2})(?:\/|-)(\d{1,2})(?:\/|-)(\d{4})$/.exec(value)
  if (!parts) return { reason: 'Invalid date' }
  const first = Number(parts[1])
  const second = Number(parts[2])
  const year = Number(parts[3])
  if (order === 'auto' && first <= 12 && second <= 12 && first !== second) return { reason: 'Ambiguous date; choose month/day or day/month.' }
  const effectiveOrder = order === 'auto' ? (first > 12 ? 'dmy' : 'mdy') : order
  if (effectiveOrder === 'ymd') return { reason: 'Date does not match YYYY-MM-DD.' }
  const month = effectiveOrder === 'mdy' ? first : second
  const day = effectiveOrder === 'mdy' ? second : first
  const date = validIso(year, month, day)
  return date ? { date } : { reason: 'Invalid date' }
}

function parseMoney(raw: string): number | null {
  const value = raw.trim()
  if (!value) return null
  const negative = /^\(.*\)$/.test(value)
  const cleaned = value.replace(/[()$£€¥,\s]/g, '')
  if (!/^[+-]?\d+(?:\.\d{1,2})?$/.test(cleaned)) return null
  const number = Number(cleaned)
  if (!Number.isFinite(number)) return null
  const minor = Math.round(Math.abs(number) * 100)
  return negative || number < 0 ? -minor : minor
}

function fingerprint(date: string, amount: number, description: string, account: string): string {
  const source = `${date}|${amount}|${description.trim().toLocaleUpperCase('en-US')}|${account.toLocaleUpperCase('en-US')}`
  let hash = 2_166_136_261
  for (const character of source) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16_777_619)
  }
  return `tx-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function mappingErrors(mapping: ColumnMapping): string[] {
  const errors: string[] = []
  if (!mapping.date) errors.push('Choose a date column.')
  if (!mapping.description) errors.push('Choose a description column.')
  if (!mapping.amount && !(mapping.debit && mapping.credit)) errors.push('Choose an amount column or both debit and credit columns.')
  return errors
}

export function reviewCsv(source: string, requestedMapping?: ColumnMapping): ImportReview {
  const parsed = Papa.parse<Record<string, string>>(source, { header: true, skipEmptyLines: 'greedy' })
  const headers = parsed.meta.fields ?? []
  const mapping = requestedMapping ?? inferMapping(headers)
  const errors = [...mappingErrors(mapping), ...parsed.errors.map((error) => `CSV row ${error.row === undefined ? '?' : error.row + 2}: ${error.message}`)]
  const transactions: Transaction[] = []
  const rejected: ImportReview['rejected'] = []
  const duplicates: ImportReview['duplicates'] = []
  const seen = new Set<string>()

  if (errors.length === 0) parsed.data.forEach((row, index) => {
    const rowNumber = index + 2
    const dateResult = parseDate(row[mapping.date!] ?? '', mapping.dateOrder)
    if (!dateResult.date) {
      rejected.push({ row: rowNumber, reason: dateResult.reason ?? 'Invalid date', values: row })
      return
    }
    const description = (row[mapping.description!] ?? '').trim()
    if (!description) {
      rejected.push({ row: rowNumber, reason: 'Description is empty.', values: row })
      return
    }
    let amount: number | null = null
    if (mapping.amount) amount = parseMoney(row[mapping.amount] ?? '')
    else {
      const debit = parseMoney(row[mapping.debit!] ?? '')
      const credit = parseMoney(row[mapping.credit!] ?? '')
      if (debit !== null && credit !== null) {
        rejected.push({ row: rowNumber, reason: 'Both debit and credit contain values.', values: row })
        return
      }
      if (debit !== null) amount = -Math.abs(debit)
      if (credit !== null) amount = Math.abs(credit)
    }
    if (amount === null || amount === 0) {
      rejected.push({ row: rowNumber, reason: 'Amount is missing, zero, or invalid.', values: row })
      return
    }
    const account = mapping.account ? (row[mapping.account] || 'Imported account').trim() : 'Imported account'
    const id = fingerprint(dateResult.date, amount, description, account)
    if (seen.has(id)) {
      duplicates.push({ row: rowNumber, transactionId: id })
      return
    }
    seen.add(id)
    transactions.push({
      id,
      date: dateResult.date,
      description,
      merchant: normalizeMerchant(description),
      amount,
      currency: 'USD',
      category: categorize(description),
      account,
    })
  })

  const sortedDates = transactions.map((item) => item.date).sort()
  return {
    headers,
    mapping,
    transactions,
    rejected,
    duplicates,
    errors,
    canCommit: errors.length === 0 && rejected.length === 0 && transactions.length > 0,
    summary: {
      totalRows: parsed.data.length,
      validRows: transactions.length,
      rejectedRows: rejected.length,
      duplicateRows: duplicates.length,
      expenses: transactions.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0),
      income: transactions.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0),
      firstDate: sortedDates[0] ?? null,
      lastDate: sortedDates.at(-1) ?? null,
    },
  }
}
