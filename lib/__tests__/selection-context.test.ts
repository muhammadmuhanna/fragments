import { describe, it, expect } from 'vitest'
import {
  clampSelection,
  isSelectionTooLarge,
  formatSelectionContext,
  truncateForPreview,
} from '../selection-context'

describe('clampSelection', () => {
  it('returns trimmed text for valid input', () => {
    expect(clampSelection('  const x = 1  ')).toBe('const x = 1')
  })

  it('returns null for empty string', () => {
    expect(clampSelection('')).toBeNull()
  })

  it('returns null for whitespace-only', () => {
    expect(clampSelection('   \n\t  ')).toBeNull()
  })

  it('returns null when text exceeds 16KB', () => {
    const large = 'a'.repeat(17_000)
    expect(clampSelection(large)).toBeNull()
  })

  it('returns text at exactly 16KB boundary', () => {
    const exact = 'a'.repeat(16_000)
    expect(clampSelection(exact)).toBe(exact)
  })
})

describe('isSelectionTooLarge', () => {
  it('returns false for small text', () => {
    expect(isSelectionTooLarge('hello')).toBe(false)
  })

  it('returns true for text over 16KB', () => {
    expect(isSelectionTooLarge('x'.repeat(17_000))).toBe(true)
  })
})

describe('formatSelectionContext', () => {
  it('wraps selection and prompt correctly', () => {
    const result = formatSelectionContext(
      { fileName: 'app.tsx', lang: 'tsx', text: 'const a = 1' },
      'Fix this variable',
    )

    expect(result).toContain('Context (selected from app.tsx)')
    expect(result).toContain('-----BEGIN SELECTED CODE-----')
    expect(result).toContain('const a = 1')
    expect(result).toContain('-----END SELECTED CODE-----')
    expect(result).toContain('Fix this variable')
  })

  it('places user prompt after the code block', () => {
    const result = formatSelectionContext(
      { fileName: 'index.js', lang: 'js', text: 'x' },
      'explain',
    )
    const codeEnd = result.indexOf('-----END SELECTED CODE-----')
    const promptStart = result.indexOf('explain')
    expect(promptStart).toBeGreaterThan(codeEnd)
  })
})

describe('truncateForPreview', () => {
  it('returns full text when under limit', () => {
    expect(truncateForPreview('short')).toBe('short')
  })

  it('truncates and adds ellipsis when over limit', () => {
    const long = 'a'.repeat(500)
    const result = truncateForPreview(long, 300)
    expect(result.length).toBe(303)
    expect(result.endsWith('...')).toBe(true)
  })

  it('uses default max of 300', () => {
    const text = 'b'.repeat(400)
    const result = truncateForPreview(text)
    expect(result.length).toBe(303)
  })
})
