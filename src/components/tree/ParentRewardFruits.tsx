import { rewardFruitPosition, type ParentReward } from '../../domain/parentReward'

type ParentRewardFruitsProps = { rewards: ParentReward[]; onSelect?: (reward: ParentReward) => void }

const FruitShape = ({ reward }: { reward: ParentReward }) => {
  if (reward.fruitType === 'apple') return <><path className="reward-fruit-body apple" d="M0 -7 C-11 -15 -16 -3 -13 8 C-10 18 -2 19 0 15 C2 19 10 18 13 8 C16 -3 11 -15 0 -7 Z" /><path className="reward-fruit-stem" d="M0 -8 Q1 -16 7 -18" /><ellipse className="reward-fruit-leaf" cx="8" cy="-15" rx="5" ry="2.5" transform="rotate(-25 8 -15)" /></>
  if (reward.fruitType === 'pear') return <><path className="reward-fruit-body pear" d="M0 -16 C-5 -14 -5 -6 -8 -2 C-17 11 -9 20 0 20 C9 20 17 11 8 -2 C5 -6 5 -14 0 -16 Z" /><path className="reward-fruit-stem" d="M0 -16 Q1 -21 5 -23" /></>
  if (reward.fruitType === 'berry') return <><g className="reward-fruit-body berry"><circle cx="-6" cy="-5" r="7" /><circle cx="6" cy="-5" r="7" /><circle cx="-8" cy="7" r="7" /><circle cx="4" cy="8" r="8" /><circle cx="0" cy="16" r="6" /></g><path className="reward-fruit-leaf" d="M0 -10 Q-8 -18 -13 -12 Q-7 -7 0 -10 Q8 -18 13 -12 Q7 -7 0 -10 Z" /></>
  return <><path className="reward-fruit-body peach" d="M0 -13 C-13 -18 -20 -2 -15 10 C-11 22 0 22 0 16 C0 22 11 22 15 10 C20 -2 13 -18 0 -13 Z" /><path className="reward-fruit-seam" d="M0 -11 Q-4 3 0 16" /><path className="reward-fruit-leaf" d="M1 -13 Q8 -22 15 -17 Q10 -11 1 -13 Z" /></>
}

export function ParentRewardFruits({ rewards, onSelect }: ParentRewardFruitsProps) {
  return <g className="parent-reward-fruits">
    {rewards.map((reward) => { const slot = rewardFruitPosition(reward.fruitSlotId); return <g key={reward.id} transform={`translate(${slot.x} ${slot.y})`} className={`parent-reward-fruit ${reward.fruitType} ${reward.status}`} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={`${reward.fruitType} reward: ${reward.title}. ${reward.status}`} data-fruit-slot={reward.fruitSlotId} onClick={onSelect ? () => onSelect(reward) : undefined} onKeyDown={onSelect ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(reward) } } : undefined}>
      {onSelect && <circle className="fruit-hit-target" r="22" aria-hidden="true" />}
      <FruitShape reward={reward} />
    </g> })}
  </g>
}
