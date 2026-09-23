export const money = (value: number, signed = false) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0, signDisplay: signed ? 'always' : 'auto',
}).format(value / 100)

export const monthName = (month: string | null) => month
  ? new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))
  : 'your latest'
