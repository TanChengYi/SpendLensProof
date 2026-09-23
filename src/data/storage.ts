import type { CategoryRule } from '../domain/categorization'
import type { Transaction } from '../domain/types'

const key = 'spendlens-proof:v1'
export interface LocalSnapshot { version: 1; transactions: Transaction[]; customRules: CategoryRule[] }

export function loadSnapshot(fallback: Transaction[]): LocalSnapshot {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { version: 1, transactions: structuredClone(fallback), customRules: [] }
    const parsed = JSON.parse(raw) as Partial<LocalSnapshot>
    if (parsed.version !== 1 || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.customRules)) throw new Error('Unsupported snapshot')
    return parsed as LocalSnapshot
  } catch { return { version: 1, transactions: structuredClone(fallback), customRules: [] } }
}

export const saveSnapshot = (snapshot: LocalSnapshot) => localStorage.setItem(key, JSON.stringify(snapshot))
export const clearSnapshot = () => localStorage.removeItem(key)
