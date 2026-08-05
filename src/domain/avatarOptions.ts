import type { AvatarId } from './types'

export type AvatarOption = {
  id: AvatarId
  label: string
}

export const CHILD_AVATARS: readonly AvatarOption[] = [
  { id: 'ice_princess', label: 'Ice Princess' },
  { id: 'warm_winter_princess', label: 'Warm Winter Princess' },
  { id: 'friendly_snow_buddy', label: 'Friendly Snow Buddy' },
  { id: 'rescue_puppy', label: 'Rescue Puppy' },
  { id: 'rainbow_unicorn', label: 'Rainbow Unicorn' },
]

export const isAvatarId = (value: unknown): value is AvatarId =>
  CHILD_AVATARS.some((avatar) => avatar.id === value)
