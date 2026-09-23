export const categories = [
  'Housing',
  'Groceries',
  'Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Health',
  'Travel',
  'Subscriptions',
  'Income',
  'Transfers',
  'Other',
] as const

export type Category = (typeof categories)[number]

export interface Transaction {
  id: string
  date: string
  description: string
  merchant: string
  amount: number
  currency: string
  category: Category
  account: string
}

export type DateOrder = 'auto' | 'ymd' | 'mdy' | 'dmy'

export interface ColumnMapping {
  date?: string
  description?: string
  amount?: string
  debit?: string
  credit?: string
  account?: string
  dateOrder: DateOrder
}

export interface RejectedRow {
  row: number
  reason: string
  values: Record<string, string>
}

export interface DuplicateRow {
  row: number
  transactionId: string
}

export interface ImportReview {
  headers: string[]
  mapping: ColumnMapping
  transactions: Transaction[]
  rejected: RejectedRow[]
  duplicates: DuplicateRow[]
  errors: string[]
  canCommit: boolean
  summary: {
    totalRows: number
    validRows: number
    rejectedRows: number
    duplicateRows: number
    expenses: number
    income: number
    firstDate: string | null
    lastDate: string | null
  }
}

export interface CategoryDelta {
  category: Category
  current: number
  previous: number
  change: number
  transactionIds: string[]
}

export interface RecurringFinding {
  id: string
  merchant: string
  cadence: 'weekly' | 'monthly'
  typicalAmount: number
  latestAmount: number
  confidence: number
  transactionIds: string[]
  explanation: string
}

export interface AnomalyFinding {
  id: string
  transactionId: string
  merchant: string
  amount: number
  baseline: number
  ratio: number
  explanation: string
}

export interface SpendingAnalysis {
  currentMonth: string | null
  previousMonth: string | null
  currentExpenses: number
  previousExpenses: number
  currentIncome: number
  previousIncome: number
  expenseChange: number
  categoryDeltas: CategoryDelta[]
  recurring: RecurringFinding[]
  anomalies: AnomalyFinding[]
}
