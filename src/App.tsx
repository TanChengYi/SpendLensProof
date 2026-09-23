import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { ChevronRight, FileSearch, Import, LockKeyhole, ShieldCheck, Sparkles, Tags, UploadCloud, WalletCards } from 'lucide-react'
import './App.css'
import { demoTransactions } from './data/demo'
import { clearSnapshot, loadSnapshot, saveSnapshot } from './data/storage'
import { analyzeSpending } from './domain/analysis'
import type { CategoryRule } from './domain/categorization'
import { reviewCsv } from './domain/import-engine'
import type { Category, ColumnMapping, ImportReview, Transaction } from './domain/types'
import { ImportView } from './features/ImportView'
import { LensView } from './features/LensView'
import { RulesView } from './features/RulesView'
import { TransactionsView } from './features/TransactionsView'
import { monthName } from './format'

export type View = 'lens' | 'transactions' | 'import' | 'rules'
function App() {
  const initial = useMemo(() => loadSnapshot(demoTransactions), [])
  const [transactions, setTransactions] = useState(initial.transactions)
  const [customRules, setCustomRules] = useState<CategoryRule[]>(initial.customRules)
  const [view, setView] = useState<View>('lens')
  const [evidenceIds, setEvidenceIds] = useState<string[]>([])
  const [importSource, setImportSource] = useState('')
  const [importName, setImportName] = useState('')
  const [importReview, setImportReview] = useState<ImportReview | null>(null)
  const analysis = useMemo(() => analyzeSpending(transactions), [transactions])
  useEffect(() => saveSnapshot({ version: 1, transactions, customRules }), [transactions, customRules])

  const openEvidence = (ids: string[]) => { setEvidenceIds(ids); setView('transactions') }
  const readFile = async (file: File) => {
    const source = typeof file.text === 'function' ? await file.text() : await new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); reader.addEventListener('load', () => resolve(String(reader.result ?? ''))); reader.addEventListener('error', () => reject(reader.error)); reader.readAsText(file)
    })
    setImportName(file.name); setImportSource(source); setImportReview(reviewCsv(source))
  }
  const updateMapping = (changes: Partial<ColumnMapping>) => {
    if (!importReview) return
    setImportReview(reviewCsv(importSource, { ...importReview.mapping, ...changes }))
  }
  const commitImport = () => {
    if (!importReview?.canCommit) return
    const ids = new Set(transactions.map((item) => item.id))
    setTransactions([...transactions, ...importReview.transactions.filter((item) => !ids.has(item.id))])
    setImportReview(null); setImportSource(''); setImportName(''); setView('lens')
  }
  const changeCategory = (transaction: Transaction, category: Category) => {
    setTransactions((current) => current.map((item) => item.merchant === transaction.merchant ? { ...item, category } : item))
    const rule: CategoryRule = { id: `custom:${transaction.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, label: `${transaction.merchant} → ${category}`, category, keywords: [transaction.merchant.toUpperCase()] }
    setCustomRules((current) => [...current.filter((item) => item.id !== rule.id), rule])
  }
  const resetDemo = () => { clearSnapshot(); setTransactions(structuredClone(demoTransactions)); setCustomRules([]); setEvidenceIds([]); setView('lens') }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => setView('lens')}><span className="brand-mark"><FileSearch size={20} /></span><span><strong>SpendLens</strong><small>Private money brief</small></span></button>
      <nav aria-label="Primary navigation">
        <Nav active={view === 'lens'} icon={<Sparkles size={18} />} label="Monthly lens" onClick={() => setView('lens')} />
        <Nav active={view === 'transactions'} icon={<WalletCards size={18} />} label="Transactions" onClick={() => { setEvidenceIds([]); setView('transactions') }} />
        <Nav active={view === 'import'} icon={<Import size={18} />} label="Import statement" onClick={() => setView('import')} />
        <Nav active={view === 'rules'} icon={<Tags size={18} />} label="Rules & privacy" onClick={() => setView('rules')} />
      </nav>
      <div className="privacy-note"><LockKeyhole size={16} /><span><strong>On this device</strong><small>{transactions.length} transactions · no sync</small></span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">Everyday checking</span><strong>{monthName(analysis.currentMonth)} 2026</strong></div><div className="top-actions"><span className="local-pill"><ShieldCheck size={15} /> Local only</span><button className="button dark" type="button" onClick={() => setView('import')}><UploadCloud size={16} /> Import CSV</button></div></header>
      {view === 'lens' && <LensView analysis={analysis} transactionCount={transactions.length} onEvidence={openEvidence} />}
      {view === 'transactions' && <TransactionsView transactions={transactions} evidenceIds={evidenceIds} onClearEvidence={() => setEvidenceIds([])} onChangeCategory={changeCategory} />}
      {view === 'import' && <ImportView name={importName} review={importReview} onFile={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void readFile(file) }} onMapping={updateMapping} onCommit={commitImport} onCancel={() => { setImportReview(null); setView('lens') }} />}
      {view === 'rules' && <RulesView customRules={customRules} onReset={resetDemo} />}
    </main>
  </div>
}

function Nav({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick(): void }) {
  return <button className={active ? 'nav-button active' : 'nav-button'} type="button" onClick={onClick}>{icon}<span>{label}</span>{active && <ChevronRight size={15} />}</button>
}

export default App
