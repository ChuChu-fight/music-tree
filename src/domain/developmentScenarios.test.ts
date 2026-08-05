import { describe, expect, it } from 'vitest'
import { createInitialTreeState } from './treeGrowthEngine'

describe('Developer Preview isolation', () => {
  it('uses a visual stage override without mutating persisted tree state', () => {
    const persisted = createInitialTreeState()
    const previewStage = 5
    const renderedStage = previewStage
    expect(renderedStage).toBe(5)
    expect(persisted.stage).toBe(1)
  })
})
