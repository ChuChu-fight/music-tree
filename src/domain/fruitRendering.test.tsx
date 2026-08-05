import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TreeStructure } from '../components/tree/TreeStructure'
import { createMusicFruitRenderPlan } from './fruitRendering'

describe('completed-piece Music Fruit capacity', () => {
  it('uses authored slots first and represents exact overflow in bounded clusters', () => {
    const capacity = createMusicFruitRenderPlan(5, 1_000).fixedSlotCapacity
    const at = createMusicFruitRenderPlan(5, capacity)
    const above = createMusicFruitRenderPlan(5, 1_000)
    expect(at.fruits).toHaveLength(capacity)
    expect(at.clusters).toHaveLength(0)
    expect(above.clusters).toHaveLength(6)
    expect(above.representedFruitCount).toBe(1_000)
  })

  it('is deterministic across refresh and import-equivalent replay', () => {
    expect(createMusicFruitRenderPlan(4, 93)).toEqual(createMusicFruitRenderPlan(4, 93))
  })

  it('represents completed pieces even when the current stage has no authored fruit slot', () => {
    expect(createMusicFruitRenderPlan(1, 12).representedFruitCount).toBe(12)
  })

  it('renders overflow as informational Music Fruit with a 44px hit target', () => {
    const onSelect = vi.fn()
    const markup = renderToStaticMarkup(<svg><TreeStructure stage={5} flowerCount={0} fruitCount={30} crownTransform="" onFruitSelect={onSelect} /></svg>)
    expect(markup).toContain('music-fruit-cluster interactive-tree-item')
    expect(markup).toContain('data-fruit-count=')
    expect(markup).toContain('class="fruit-hit-target" r="22"')
    expect(markup).not.toContain('claim')
  })
})
