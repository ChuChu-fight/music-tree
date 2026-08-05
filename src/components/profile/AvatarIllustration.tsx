import type { AvatarId } from '../../domain/types'

type AvatarIllustrationProps = {
  avatarId: AvatarId
  className?: string
}

export function AvatarIllustration({ avatarId, className }: AvatarIllustrationProps) {
  const common = { viewBox: '0 0 96 96', role: 'img', className, focusable: false } as const

  if (avatarId === 'friendly_snow_buddy') return (
    <svg {...common} aria-label="Friendly Snow Buddy avatar">
      <circle cx="48" cy="48" r="45" fill="#d9f4fb" />
      <circle cx="48" cy="54" r="25" fill="#fbfeff" stroke="#9fcbd8" strokeWidth="2" />
      <circle cx="48" cy="31" r="18" fill="#fff" stroke="#9fcbd8" strokeWidth="2" />
      <circle cx="42" cy="29" r="2.5" fill="#38506b" /><circle cx="54" cy="29" r="2.5" fill="#38506b" />
      <path d="M44 37 Q48 40 53 36" fill="none" stroke="#a45f70" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 44 Q48 51 63 43" fill="none" stroke="#d46c79" strokeWidth="7" strokeLinecap="round" />
      <circle cx="48" cy="51" r="2.5" fill="#6e8ba4" /><circle cx="48" cy="61" r="2.5" fill="#6e8ba4" />
    </svg>
  )

  if (avatarId === 'rescue_puppy') return (
    <svg {...common} aria-label="Rescue Puppy avatar">
      <circle cx="48" cy="48" r="45" fill="#f7dfca" />
      <path d="M27 31 Q13 36 21 60 Q28 54 35 43" fill="#986248" />
      <path d="M69 31 Q83 36 75 60 Q68 54 61 43" fill="#986248" />
      <path d="M28 42 Q31 22 48 21 Q65 22 68 42 L64 67 Q48 78 32 67 Z" fill="#d99a70" stroke="#76513e" strokeWidth="2" />
      <ellipse cx="48" cy="54" rx="15" ry="13" fill="#f5d4b5" />
      <circle cx="40" cy="43" r="3" fill="#293e50" /><circle cx="57" cy="43" r="3" fill="#293e50" />
      <path d="M44 52 Q48 48 52 52 Q50 57 48 57 Q46 57 44 52" fill="#374251" />
      <path d="M28 68 Q48 78 68 68" fill="none" stroke="#56a7b8" strokeWidth="8" />
      <path d="M48 69 l6 5 -6 7 -6-7z" fill="#f5c65a" stroke="#8b6a24" strokeWidth="1.5" />
    </svg>
  )

  if (avatarId === 'rainbow_unicorn') return (
    <svg {...common} aria-label="Rainbow Unicorn avatar">
      <circle cx="48" cy="48" r="45" fill="#eee2fb" />
      <path d="M51 24 L59 4 L64 27" fill="#bdeffc" stroke="#7589b5" strokeWidth="2" />
      <path d="M31 31 Q17 31 17 48 Q22 41 34 42" fill="#f0a9c6" />
      <path d="M34 27 Q23 20 22 37 Q29 32 38 34" fill="#9edfe4" />
      <path d="M65 30 Q75 22 76 40 Q69 34 62 39" fill="#d8b0ed" />
      <path d="M27 44 Q29 25 48 23 Q67 25 69 44 L64 68 Q48 78 32 68 Z" fill="#fffafc" stroke="#8d79ad" strokeWidth="2" />
      <path d="M32 34 Q48 22 65 34" fill="none" stroke="#f0a9c6" strokeWidth="6" />
      <circle cx="40" cy="48" r="2.8" fill="#40526f" /><circle cx="57" cy="48" r="2.8" fill="#40526f" />
      <path d="M43 59 Q48 63 54 58" fill="none" stroke="#b36d91" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  const warm = avatarId === 'warm_winter_princess'
  return (
    <svg {...common} aria-label={`${warm ? 'Warm Winter Princess' : 'Ice Princess'} avatar`}>
      <circle cx="48" cy="48" r="45" fill={warm ? '#ead3ec' : '#d8f1fa'} />
      <path d="M26 42 Q25 18 48 17 Q72 18 70 46 L65 72 L30 72 Z" fill={warm ? '#9f503b' : '#dbe8ee'} />
      <ellipse cx="48" cy="45" rx="18" ry="22" fill="#f6d5c4" />
      <path d="M30 39 Q32 17 49 18 Q65 19 68 38 Q56 28 35 34" fill={warm ? '#a9543d' : '#e8f1f4'} />
      <circle cx="41" cy="45" r="2.5" fill="#40516b" /><circle cx="56" cy="45" r="2.5" fill="#40516b" />
      <path d={warm ? 'M42 55 Q48 60 55 54' : 'M43 55 Q48 58 54 54'} fill="none" stroke="#b46775" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 82 Q29 64 48 64 Q67 64 73 82" fill={warm ? '#8b416d' : '#81bdd8'} />
      <path d="M29 70 Q48 79 68 69" fill="none" stroke={warm ? '#c64e5e' : '#c7e7f0'} strokeWidth="7" />
      {!warm && <g fill="#f8fdff" stroke="#7198b5" strokeWidth="1.5"><path d="M48 7 v15 M41 11 l14 8 M55 11 l-14 8" /><circle cx="48" cy="14" r="3" /></g>}
      {warm && <path d="M28 28 Q48 13 69 29" fill="none" stroke="#c86b58" strokeWidth="4" />}
    </svg>
  )
}
