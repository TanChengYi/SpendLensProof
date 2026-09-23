import type { Category } from './types'

export interface CategoryRule {
  id: string
  label: string
  category: Category
  keywords: string[]
}

export const defaultRules: CategoryRule[] = [
  { id: 'income', label: 'Payroll and income', category: 'Income', keywords: ['PAYROLL', 'SALARY', 'DIRECT DEP', 'INTEREST PAID'] },
  { id: 'transfer', label: 'Transfers and card payments', category: 'Transfers', keywords: ['TRANSFER', 'CARD PAYMENT', 'AUTOPAY PAYMENT'] },
  { id: 'housing', label: 'Rent and mortgage', category: 'Housing', keywords: ['RENT', 'MORTGAGE', 'PROPERTY MGMT'] },
  { id: 'subscription', label: 'Digital subscriptions', category: 'Subscriptions', keywords: ['STREAMBOX', 'NETFLIX', 'SPOTIFY', 'ICLOUD', 'DROPBOX', 'ADOBE'] },
  { id: 'groceries', label: 'Groceries', category: 'Groceries', keywords: ['FRESH MART', 'WHOLE FOODS', 'SAFEWAY', 'TRADER JOE', 'GROCERY'] },
  { id: 'dining', label: 'Dining and coffee', category: 'Dining', keywords: ['COFFEE', 'GREEN TABLE', 'RESTAURANT', 'CAFE', 'DOORDASH', 'UBER EATS'] },
  { id: 'transport', label: 'Transport', category: 'Transport', keywords: ['SHELL', 'CHEVRON', 'UBER', 'LYFT', 'TRANSIT', 'PARKING'] },
  { id: 'utilities', label: 'Utilities', category: 'Utilities', keywords: ['ELECTRIC', 'ENERGY', 'WATER', 'INTERNET', 'MOBILE'] },
  { id: 'health', label: 'Health', category: 'Health', keywords: ['PHARMACY', 'CLINIC', 'DENTAL', 'HEALTH'] },
  { id: 'travel', label: 'Travel', category: 'Travel', keywords: ['AIRLINES', 'HOTEL', 'AIRBNB', 'BOOKING.COM'] },
  { id: 'shopping', label: 'Shopping', category: 'Shopping', keywords: ['AMAZON', 'TARGET', 'STORE', 'SHOP'] },
]

const titleCase = (value: string) => value
  .toLocaleLowerCase('en-US')
  .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('en-US'))

export function normalizeMerchant(description: string): string {
  const normalized = description
    .toLocaleUpperCase('en-US')
    .replace(/^(?:SQ \*|TST\*|PAYPAL \*|POS |DEBIT CARD PURCHASE )/, '')
    .replace(/\s+#?\d{3,}$/g, '')
    .replace(/[^A-Z0-9&' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return titleCase(normalized || description.trim())
}

export function categorize(description: string, rules: CategoryRule[] = defaultRules): Category {
  const value = description.toLocaleUpperCase('en-US')
  return rules.find((rule) => rule.keywords.some((keyword) => value.includes(keyword)))?.category ?? 'Other'
}
