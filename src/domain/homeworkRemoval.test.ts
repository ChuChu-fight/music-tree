import { describe, expect, it, vi } from 'vitest'
import { confirmHomeworkRemoval } from './homeworkRemoval'

describe('homework removal confirmation', () => {
  it('requires an explicit confirmation', () => {
    const decline = vi.fn(() => false)
    const accept = vi.fn(() => true)
    expect(confirmHomeworkRemoval('New piece', decline)).toBe(false)
    expect(confirmHomeworkRemoval('New piece', accept)).toBe(true)
    expect(accept).toHaveBeenCalledWith('Delete “New piece”? This cannot be undone.')
  })
})
