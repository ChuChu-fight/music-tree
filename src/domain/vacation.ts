export type VacationPeriod = {
  id: string
  childId: string
  startDate: string
  endDate: string
  note?: string
  createdAt: string
  cancelledAt?: string
  endedEarlyAt?: string
}

export type VacationStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

const dayMs = 86_400_000
const dateOnly = (value: string) => value.slice(0, 10)
const parseDate = (value: string) => new Date(`${dateOnly(value)}T00:00:00Z`)
const addDays = (value: string, amount: number) => new Date(parseDate(value).getTime() + amount * dayMs).toISOString().slice(0, 10)

export const effectiveVacationEnd = (period: VacationPeriod) => period.endedEarlyAt ? addDays(period.endedEarlyAt, -1) : period.endDate

export const vacationStatus = (period: VacationPeriod, today: string): VacationStatus => {
  if (period.cancelledAt) return 'cancelled'
  const end = effectiveVacationEnd(period)
  if (today < period.startDate) return 'scheduled'
  if (today <= end) return 'active'
  return 'completed'
}

export const isVacationDay = (date: string, periods: VacationPeriod[]) => periods.some((period) =>
  !period.cancelledAt && date >= period.startDate && date <= effectiveVacationEnd(period),
)

export const vacationDatesBetween = (startDate: string, endDate: string, periods: VacationPeriod[]) => {
  const dates = new Set<string>()
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) if (isVacationDay(date, periods)) dates.add(date)
  return dates
}

export const effectiveElapsedDays = (startDate: string, endDate: string, periods: VacationPeriod[]) => {
  const calendarDays = Math.max(0, Math.floor((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / dayMs))
  return Math.max(0, calendarDays - vacationDatesBetween(startDate, endDate, periods).size)
}

export const weekKeyForDate = (date: string) => {
  const value = parseDate(date)
  const day = value.getUTCDay() || 7
  value.setUTCDate(value.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1))
  return `${value.getUTCFullYear()}-${Math.ceil((((value.getTime() - yearStart.getTime()) / dayMs) + 1) / 7)}`
}

export const vacationWeekKeys = (startDate: string, endDate: string, periods: VacationPeriod[]) =>
  new Set([...vacationDatesBetween(startDate, endDate, periods)].map(weekKeyForDate))

export const vacationAwareHealthCarryover = (previousFinalHealth: number, date: string, periods: VacationPeriod[]) =>
  isVacationDay(date, periods) ? previousFinalHealth : Math.round(previousFinalHealth * 0.8)

export const validateVacationPeriod = (startDate: string, endDate: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return 'Choose a start and end date.'
  if (endDate < startDate) return 'The end date must be on or after the start date.'
  return null
}
