import { FileSearch, ListFilter, Search, X } from 'lucide-react'
import { useState } from 'react'
import { money } from '../format'
import { categories, type Category, type Transaction } from '../domain/types'

export function TransactionsView({ transactions, evidenceIds, onClearEvidence, onChangeCategory }: { transactions: Transaction[]; evidenceIds: string[]; onClearEvidence(): void; onChangeCategory(transaction: Transaction, category: Category): void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const filtered = transactions.filter((item) => evidenceIds.length === 0 || evidenceIds.includes(item.id)).filter((item) => category === 'All' || item.category === category).filter((item) => `${item.description} ${item.merchant}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date))
  return <div className="page"><div className="page-title"><div><span className="kicker">Inspect the evidence</span><h1>Transactions</h1><p>{evidenceIds.length ? `${filtered.length} transaction${filtered.length === 1 ? '' : 's'} linked to the selected finding.` : 'Search original descriptions and correct categories transparently.'}</p></div></div>
    {evidenceIds.length > 0 && <div className="evidence-banner"><FileSearch size={18} /> Evidence filter is active<button type="button" onClick={onClearEvidence}><X size={14} /> Clear</button></div>}
    <section className="panel table-panel"><div className="table-tools"><label className="search-box"><Search size={16} /><span className="sr-only">Search transactions</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchant or description" /></label><label className="select-box"><ListFilter size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value as Category | 'All')}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="transaction-table" role="table"><div className="transaction-head" role="row"><span>Date</span><span>Merchant / original description</span><span>Category</span><span>Amount</span></div>{filtered.map((item) => <div className="transaction-row" role="row" key={item.id}><time>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${item.date}T00:00:00Z`))}</time><span><strong>{item.merchant}</strong><small>{item.description}</small></span><select aria-label={`Category for ${item.description}`} value={item.category} onChange={(event) => onChangeCategory(item, event.target.value as Category)}>{categories.map((value) => <option key={value}>{value}</option>)}</select><strong className={item.amount > 0 ? 'income' : ''}>{money(item.amount)}</strong></div>)}</div>
      {filtered.length === 0 && <div className="empty-state"><Search size={24} /><h2>No transactions match</h2><p>Clear a filter or try a different search.</p></div>}
    </section>
  </div>
}
