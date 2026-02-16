export type SelectionMode = 'auto' | 'menu'

export type CodeSelection = {
  fileName: string
  lang: string
  text: string
}

const MAX_SELECTION_BYTES = 16_000

export function clampSelection(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (new Blob([trimmed]).size > MAX_SELECTION_BYTES) return null
  return trimmed
}

export function isSelectionTooLarge(text: string): boolean {
  return new Blob([text.trim()]).size > MAX_SELECTION_BYTES
}

export function formatSelectionContext(
  selection: CodeSelection,
  userPrompt: string,
): string {
  return `Context (selected from ${selection.fileName}):\n-----BEGIN SELECTED CODE-----\n${selection.text}\n-----END SELECTED CODE-----\n\n${userPrompt}`
}

export function truncateForPreview(text: string, max = 300): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}
