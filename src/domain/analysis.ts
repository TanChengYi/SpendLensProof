import { categories, type AnomalyFinding, type CategoryDelta, type RecurringFinding, type SpendingAnalysis, type Transaction } from './types'

const monthOf = (transaction: Transaction) => transaction.date.slice(0, 7)
const expenseTotal = (transactions: Transaction[]) => transactions.reduce((sum, item) => sum + (item.amount < 0 && item.category !== 'Transfers' ? Math.abs(item.amount) : 0), 0)
const incomeTotal = (transactions: Transaction[]) => transactions.reduce((sum, item) => sum + (item.amount > 0 && item.category !== 'Transfers' ? item.amount : 0), 0)
const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle]! : Math.round((sorted[middle - 1]! + sorted[middle]!) / 2)
}
const daysBetween = (left: string, right: string): number => Math.round((Date.parse(right) - Date.parse(left)) / 86_400_000)

function categoryDeltas(current: Transaction[], previous: Transaction[]): CategoryDelta[] {
  return categories
    .filter((category) => !['Income', 'Transfers'].includes(category))
    .map((category) => {
      const currentItems = current.filter((item) => item.category === category && item.amount < 0)
      const previousItems = previous.filter((item) => item.category === category && item.amount < 0)
      const currentValue = expenseTotal(currentItems)
      const previousValue = expenseTotal(previousItems)
      return {
        category,
        current: currentValue,
        previous: previousValue,
        change: currentValue - previousValue,
        transactionIds: currentItems.map((item) => item.id),
      }
    })
    .filter((item) => item.current !== 0 || item.previous !== 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

function recurringFindings(transactions: Transaction[]): RecurringFinding[] {
  const byMerchant = new Map<string, Transaction[]>()
  for (const transaction of transactions.filter((item) => item.amount < 0 && item.category !== 'Transfers')) {
    byMerchant.set(transaction.merchant, [...(byMerchant.get(transaction.merchant) ?? []), transaction])
  }
  return [...byMerchant.entries()].flatMap(([merchant, values]) => {
    const sorted = values.sort((a, b) => a.date.localeCompare(b.date))
    if (sorted.length < 2) return []
    const intervals = sorted.slice(1).map((item, index) => daysBetween(sorted[index]!.date, item.date))
    const averageInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length
    const cadence = averageInterval >= 25 && averageInterval <= 35 ? 'monthly' : averageInterval >= 6 && averageInterval <= 8 ? 'weekly' : null
    const amounts = sorted.map((item) => Math.abs(item.amount))
    const typicalAmount = median(amounts)
    const spread = (Math.max(...amounts) - Math.min(...amounts)) / typicalAmount
    if (!cadence || spread > 0.15) return []
    const confidence = Math.min(0.99, Math.max(0.5, 0.74 + Math.min(sorted.length, 4) * 0.06 - spread))
    return [{
      id: `recurring:${merchant}`,
      merchant,
      cadence,
      typicalAmount,
      latestAmount: amounts.at(-1)!,
      confidence,
      transactionIds: sorted.map((item) => item.id),
      explanation: `${sorted.length} similar charges arrived about every ${Math.round(averageInterval)} days.`,
    } satisfies RecurringFinding]
  }).sort((a, b) => b.latestAmount - a.latestAmount)
}

function anomalyFindings(transactions: Transaction[]): AnomalyFinding[] {
  const byMerchant = new Map<string, Transaction[]>()
  for (const transaction of transactions.filter((item) => item.amount < 0 && item.category !== 'Transfers')) {
    byMerchant.set(transaction.merchant, [...(byMerchant.get(transaction.merchant) ?? []), transaction])
  }
  return [...byMerchant.entries()].flatMap(([merchant, values]) => {
    const sorted = values.sort((a, b) => a.date.localeCompare(b.date))
    return sorted.flatMap((transaction, index) => {
      const history = sorted.slice(0, index).map((item) => Math.abs(item.amount))
      if (history.length < 3) return []
      const baseline = median(history)
      const amount = Math.abs(transaction.amount)
      const ratio = baseline === 0 ? 0 : amount / baseline
      if (ratio < 1.8 || amount - baseline < 2_500) return []
      return [{
        id: `anomaly:${transaction.id}`,
        transactionId: transaction.id,
        merchant,
        amount,
        baseline,
        ratio,
        explanation: `${merchant} was ${ratio.toFixed(1)}× its usual ${baseline} minor-unit charge.`,
      } satisfies AnomalyFinding]
    })
  }).sort((a, b) => b.ratio - a.ratio)
}

export function analyzeSpending(transactions: Transaction[]): SpendingAnalysis {
  const months = [...new Set(transactions.map(monthOf))].sort()
  const currentMonth = months.at(-1) ?? null
  const previousMonth = months.at(-2) ?? null
  const current = currentMonth ? transactions.filter((item) => monthOf(item) === currentMonth) : []
  const previous = previousMonth ? transactions.filter((item) => monthOf(item) === previousMonth) : []
  const currentExpenses = expenseTotal(current)
  const previousExpenses = expenseTotal(previous)
  return {
    currentMonth,
    previousMonth,
    currentExpenses,
    previousExpenses,
    currentIncome: incomeTotal(current),
    previousIncome: incomeTotal(previous),
    expenseChange: currentExpenses - previousExpenses,
    categoryDeltas: categoryDeltas(current, previous),
    recurring: recurringFindings(transactions),
    anomalies: anomalyFindings(transactions),
  }
}
