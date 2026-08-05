import type { AvatarId, TreeState } from '../../domain/types'
import type { TreeStage } from '../../domain/treeStageBlueprints'

type TreeSceneCompanionsProps = {
  stage: TreeStage
  avatarId?: AvatarId
  creatureState: TreeState['creatureState']
}

const lucyPalette: Record<AvatarId, { hair: string; coat: string; cape: string }> = {
  ice_princess: { hair: '#e6e2da', coat: '#8fc6d8', cape: '#c9b9df' },
  warm_winter_princess: { hair: '#9a543f', coat: '#a84f6c', cape: '#76558e' },
  friendly_snow_buddy: { hair: '#795f50', coat: '#b7dce5', cape: '#d18a9e' },
  rescue_puppy: { hair: '#704f43', coat: '#d38a68', cape: '#5ba5b2' },
  rainbow_unicorn: { hair: '#a77ac0', coat: '#d49fbe', cape: '#8fcdd1' },
}

export function TreeSceneCompanions({ stage, avatarId = 'ice_princess', creatureState }: TreeSceneCompanionsProps) {
  const nibblerVisible = creatureState === 'watching' || creatureState === 'nibbling'
  const palette = lucyPalette[avatarId]

  return (
    <g className="tree-scene-companions" aria-hidden="true">
      {stage >= 2 && <g className="melody-trail">
        <path d="M72 260 C112 232 135 246 158 219 C177 197 188 204 207 187" />
        <circle cx="78" cy="257" r="2" /><circle cx="126" cy="239" r="1.6" /><circle cx="174" cy="204" r="2" />
        {stage >= 3 && <><text x="105" y="235">♪</text><text x="172" y="195">♫</text><text x="278" y="191">♪</text></>}
      </g>}

      {stage >= 2 && <g className="treble-ornament" transform="translate(237 300)">
        <circle r="13" /><text x="-6" y="8">𝄞</text>
      </g>}

      <g className="scene-lucy" transform="translate(255 394)">
        <ellipse className="lucy-shadow" cy="15" rx="23" ry="5" />
        <path className="lucy-cape" d="M-9 -21 Q-21 -4 -15 10 Q0 18 16 9 Q19 -5 9 -21 Z" fill={palette.cape} />
        <path className="lucy-coat" d="M-8 -22 Q0 -27 8 -22 L13 7 Q0 13 -13 7 Z" fill={palette.coat} />
        <path className="lucy-arm" d="M-9 -17 Q-21 -13 -28 -4" />
        <circle className="lucy-mitten" cx="-29" cy="-3" r="3" fill={palette.coat} />
        <path className="lucy-legs" d="M-6 8 L-7 16 M6 8 L8 16" />
        <path className="lucy-boots" d="M-11 16 Q-7 13 -3 17 M4 17 Q8 13 12 17" />
        <circle className="lucy-face" cy="-36" r="12" />
        <path className="lucy-hair" d="M-11 -38 Q-8 -53 4 -50 Q15 -47 11 -33 Q7 -43 -1 -43 Q-7 -43 -11 -38 Z" fill={palette.hair} />
        <circle className="lucy-eye" cx="-4" cy="-36" r="1.3" /><circle className="lucy-eye" cx="5" cy="-36" r="1.3" />
        <path className="lucy-smile" d="M-3 -30 Q1 -27 5 -31" />
        <path className="lucy-hat" d="M-12 -45 Q0 -57 12 -45 Q0 -41 -12 -45 Z" fill={palette.coat} />
        <circle className="lucy-hat-pom" cy="-55" r="3.5" />
        <g className="lucy-magic"><circle cx="-34" cy="-10" r="2" /><path d="M-40 -18 l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" /></g>
      </g>

      {stage >= 3 && <g className="guardian-cat" transform="translate(112 395)">
        <path className="companion-shadow" d="M-28 13 Q0 22 31 13" />
        <path className="cat-tail" d="M17 5 Q38 2 28 -17" />
        <ellipse cx="0" cy="2" rx="18" ry="14" />
        <path d="M-14 -8 L-16 -24 L-5 -15 Q0 -18 6 -15 L17 -24 L14 -7 Z" />
        <circle cx="-6" cy="-8" r="2" /><circle cx="7" cy="-8" r="2" />
        <path className="cat-smile" d="M-2 -2 Q1 1 4 -2" />
        <path className="cat-star" d="M0 3 l2.5 5 5.5.8-4 4 .9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-4 5.5-.8z" />
      </g>}

      {stage >= 2 && <g className="snow-buddy" transform="translate(307 390)">
        <path className="companion-shadow" d="M-27 18 Q0 25 28 18" />
        <circle cy="3" r="17" /><circle cy="-20" r="12" />
        <circle cx="-4" cy="-22" r="1.7" /><circle cx="4" cy="-22" r="1.7" />
        <path className="snow-smile" d="M-5 -16 Q0 -12 6 -17" />
        <path className="snow-scarf" d="M-11 -8 Q0 -3 12 -9 M7 -6 L13 7" />
        <path className="snow-arm" d="M-15 -1 L-26 -11 M15 -1 L25 -9" />
      </g>}

      {nibblerVisible && (
        <g className={`leaf-nibbler ${creatureState}`} transform="translate(349 398)">
          <path className="snow-hide" d="M-27 14 Q-9 -4 10 11 Q22 2 31 16 Z" />
          <path className="nibbler-ear" d="M-13 -3 L-18 -19 L-5 -10 M12 -3 L18 -18 L5 -10" />
          <ellipse cy="0" rx="15" ry="13" />
          <circle cx="-5" cy="-3" r="2" /><circle cx="6" cy="-3" r="2" />
          <path className="nibbler-smile" d="M-4 4 Q1 8 7 3" />
          {creatureState === 'nibbling' && <text x="-27" y="-17">⌁</text>}
        </g>
      )}
    </g>
  )
}
