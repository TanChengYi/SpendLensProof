import { FileSearch, ShieldCheck, UploadCloud } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { money } from '../format'
import type { ColumnMapping, ImportReview } from '../domain/types'
import { Heading } from './LensView'

export function ImportView({ name, review, onFile, onMapping, onCommit, onCancel }: { name: string; review: ImportReview | null; onFile(event: ChangeEvent<HTMLInputElement>): void; onMapping(changes: Partial<ColumnMapping>): void; onCommit(): void; onCancel(): void }) {
  return <div className="page"><div className="page-title"><div><span className="kicker">Local import</span><h1>Review before it changes your totals.</h1><p>SpendLens reads the file in this browser. Nothing is uploaded, and ambiguous rows cannot be committed.</p></div></div>
    {!review ? <label className="drop-zone"><input type="file" accept=".csv,text/csv" onChange={onFile} aria-label="Choose CSV statement" /><span className="upload-orb"><UploadCloud size={26} /></span><strong>Drop a CSV statement here</strong><span>or choose a file · Date + description + amount required</span><em>Processed locally</em></label> : <>
      <section className="import-file"><FileSearch size={20} /><span><strong>{name}</strong><small>{review.summary.totalRows} source rows · {review.headers.length} columns</small></span><label className="replace-file">Choose another<input type="file" accept=".csv,text/csv" onChange={onFile} aria-label="Choose CSV statement" /></label></section>
      <section className="panel mapping-panel"><Heading kicker="Step 1" title="Confirm the interpretation" aside={review.errors.length ? 'Needs mapping' : 'Columns mapped'} /><div className="mapping-grid"><MappingSelect label="Date" value={review.mapping.date} headers={review.headers} onChange={(date) => onMapping({ date })} /><MappingSelect label="Description" value={review.mapping.description} headers={review.headers} onChange={(description) => onMapping({ description })} /><MappingSelect label="Amount" value={review.mapping.amount} headers={review.headers} onChange={(amount) => onMapping({ amount, debit: undefined, credit: undefined })} /><label><span>Date format</span><select value={review.mapping.dateOrder} onChange={(event) => onMapping({ dateOrder: event.target.value as ColumnMapping['dateOrder'] })}><option value="auto">Detect; stop if ambiguous</option><option value="mdy">Month / day / year</option><option value="dmy">Day / month / year</option><option value="ymd">Year / month / day</option></select></label></div>{review.errors.map((error) => <p className="inline-error" role="alert" key={error}>{error}</p>)}</section>
      <section className="review-grid"><ReviewStat label="Accepted" value={String(review.summary.validRows)} detail={`${review.summary.firstDate ?? '—'} → ${review.summary.lastDate ?? '—'}`} /><ReviewStat label="Rejected" value={String(review.summary.rejectedRows)} detail={review.rejected[0]?.reason ?? 'No invalid rows'} warning={review.summary.rejectedRows > 0} /><ReviewStat label="Duplicates skipped" value={String(review.summary.duplicateRows)} detail="Exact identity match" /><ReviewStat label="Net movement" value={money(review.summary.income - review.summary.expenses)} detail={`${money(review.summary.income)} in · ${money(review.summary.expenses)} out`} /></section>
      {review.rejected.length > 0 && <section className="panel rejection-panel"><Heading kicker="Blocked rows" title="Resolve before commit" />{review.rejected.slice(0, 5).map((item) => <div className="rejection-row" key={item.row}><span>Row {item.row}</span><strong>{item.reason}</strong><code>{Object.values(item.values).join(' · ')}</code></div>)}</section>}
      <div className="import-actions"><button className="button ghost" type="button" onClick={onCancel}>Cancel</button><button className="button dark" type="button" onClick={onCommit} disabled={!review.canCommit}><ShieldCheck size={16} /> Commit import</button></div>
    </>}
  </div>
}

function MappingSelect({ label, value, headers, onChange }: { label: string; value?: string; headers: string[]; onChange(value: string | undefined): void }) {
  return <label><span>{label}</span><select value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)}><option value="">Choose column</option>{headers.map((header) => <option key={header}>{header}</option>)}</select></label>
}

function ReviewStat({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <article className={warning ? 'review-card warning' : 'review-card'}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}
