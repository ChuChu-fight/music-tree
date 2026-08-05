export const SUPPORTED_REWARD_FRUIT_TYPES = ['apple', 'pear', 'berry', 'peach'] as const
export type RewardFruitType = typeof SUPPORTED_REWARD_FRUIT_TYPES[number]
export type ParentReward = { id: string; childId: string; title: string; fruitType: RewardFruitType; status: 'available' | 'claimed'; grantedAt: string; claimedAt?: string; fruitSlotId: string }

export const REWARD_FRUIT_SLOTS = [
  { id: 'reward-slot-1', x: 132, y: 174 },
  { id: 'reward-slot-2', x: 268, y: 180 },
  { id: 'reward-slot-3', x: 105, y: 235 },
  { id: 'reward-slot-4', x: 294, y: 241 },
  { id: 'reward-slot-5', x: 164, y: 121 },
  { id: 'reward-slot-6', x: 236, y: 126 },
] as const

export const isRewardFruitType = (value: unknown): value is RewardFruitType => SUPPORTED_REWARD_FRUIT_TYPES.includes(value as RewardFruitType)
const OVERFLOW_SLOT_PREFIX = 'reward-overflow-'

export const selectRewardFruitSlot = (existing: ParentReward[]) => {
  const available = REWARD_FRUIT_SLOTS.find((slot) => !existing.some((reward) => reward.fruitSlotId === slot.id))
  if (available) return available.id
  const usedOverflowOrdinals = new Set(existing.map((reward) => reward.fruitSlotId.startsWith(OVERFLOW_SLOT_PREFIX) ? Number(reward.fruitSlotId.slice(OVERFLOW_SLOT_PREFIX.length)) : 0))
  let ordinal = 1
  while (usedOverflowOrdinals.has(ordinal)) ordinal += 1
  return `${OVERFLOW_SLOT_PREFIX}${ordinal}`
}

export const rewardFruitPosition = (fruitSlotId: string) => {
  const fixed = REWARD_FRUIT_SLOTS.find((slot) => slot.id === fruitSlotId)
  if (fixed) return fixed
  const ordinal = fruitSlotId.startsWith(OVERFLOW_SLOT_PREFIX) ? Number(fruitSlotId.slice(OVERFLOW_SLOT_PREFIX.length)) : 0
  if (!Number.isInteger(ordinal) || ordinal < 1) return REWARD_FRUIT_SLOTS[0]
  const angle = (ordinal * 137.508 - 90) * Math.PI / 180
  const ring = 1 + Math.floor((ordinal - 1) / 12)
  const radiusX = Math.min(148, 92 + ring * 14)
  const radiusY = Math.min(116, 64 + ring * 11)
  return { id: fruitSlotId, x: Math.round(200 + Math.cos(angle) * radiusX), y: Math.round(190 + Math.sin(angle) * radiusY) }
}
