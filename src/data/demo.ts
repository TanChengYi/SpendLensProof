import { categorize, normalizeMerchant } from '../domain/categorization'
import type { Transaction } from '../domain/types'

const transaction = (id: string, date: string, description: string, amount: number, category?: Transaction['category']): Transaction => ({
  id, date, description, merchant: normalizeMerchant(description), amount, currency: 'USD',
  category: category ?? categorize(description), account: 'Everyday checking',
})

export const demoTransactions: Transaction[] = [
  transaction('may-pay', '2026-05-01', 'PAYROLL ACME INC', 465000), transaction('may-rent', '2026-05-01', 'CITY RENT', -145000), transaction('may-stream', '2026-05-02', 'STREAMBOX', -1599),
  transaction('may-fresh-1', '2026-05-04', 'FRESH MART #1032', -5200), transaction('may-electric', '2026-05-06', 'NORTH ELECTRIC', -9200), transaction('may-coffee', '2026-05-09', 'SQ *NORTHSTAR COFFEE 1922', -675),
  transaction('may-fresh-2', '2026-05-17', 'FRESH MART #2081', -4800), transaction('may-table', '2026-05-22', 'TST* GREEN TABLE 0081', -4200), transaction('may-transit', '2026-05-25', 'CITY TRANSIT', -2400),
  transaction('jun-pay', '2026-06-01', 'PAYROLL ACME INC', 465000), transaction('jun-rent', '2026-06-01', 'CITY RENT', -145000), transaction('jun-stream', '2026-06-02', 'STREAMBOX', -1599),
  transaction('jun-fresh-1', '2026-06-04', 'FRESH MART #3104', -5000), transaction('jun-electric', '2026-06-06', 'NORTH ELECTRIC', -8800), transaction('jun-coffee', '2026-06-09', 'SQ *NORTHSTAR COFFEE 2831', -725),
  transaction('jun-table-1', '2026-06-10', 'TST* GREEN TABLE 0102', -4500), transaction('jun-shop', '2026-06-16', 'TARGET STORE 1149', -7600), transaction('jun-fresh-2', '2026-06-19', 'FRESH MART #3971', -5100),
  transaction('jun-table-2', '2026-06-23', 'TST* GREEN TABLE 0141', -3200), transaction('jun-transit', '2026-06-25', 'CITY TRANSIT', -2400),
  transaction('jul-pay', '2026-07-01', 'PAYROLL ACME INC', 465000), transaction('jul-rent', '2026-07-01', 'CITY RENT', -145000), transaction('jul-stream', '2026-07-02', 'STREAMBOX', -1699),
  transaction('jul-fresh-spike', '2026-07-04', 'FRESH MART #4482', -18200), transaction('jul-electric', '2026-07-06', 'NORTH ELECTRIC', -10100), transaction('jul-coffee', '2026-07-09', 'SQ *NORTHSTAR COFFEE 3920', -750),
  transaction('jul-table-1', '2026-07-10', 'TST* GREEN TABLE 0182', -6400), transaction('jul-air', '2026-07-14', 'NORTHWIND AIRLINES', -28600), transaction('jul-shop', '2026-07-18', 'TARGET STORE 1204', -12400),
  transaction('jul-table-2', '2026-07-22', 'TST* GREEN TABLE 0193', -5100), transaction('jul-transit', '2026-07-25', 'CITY TRANSIT', -2400),
]
