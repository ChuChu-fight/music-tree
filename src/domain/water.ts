export type WaterPracticeRecord = { id?: string; childId: string; date: string; minutes: number; quality?: string | null }

export const MAX_DAILY_PRACTICE_RECORDS = 3

export const calculatePracticeWater = (record: Pick<WaterPracticeRecord, 'minutes' | 'quality'>) => {
  if (!record.quality || record.minutes < 5) return 0
  if (record.minutes < 10) return 1
  if (record.minutes < 20) return 2
  return 3
}

export const selectDailyWater = (records: WaterPracticeRecord[], childId: string, localDate: string) => Math.min(3, records.filter((record) => record.childId === childId && record.date === localDate).reduce((sum, record) => sum + calculatePracticeWater(record), 0))

export const countDailyPracticeRecords = (records: WaterPracticeRecord[], childId: string, localDate: string, excludingId?: string) => records.filter((record) => record.id !== excludingId && record.childId === childId && record.date === localDate).length
