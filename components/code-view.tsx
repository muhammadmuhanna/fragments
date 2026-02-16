import './code-theme.css'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import type { SelectionMode } from '@/lib/selection-context'
import { useCallback, useEffect, useRef } from 'react'

export function CodeView({
  code,
  lang,
  selectionMode = 'auto',
  onSelectionDone,
  onContextMenuSelection,
}: {
  code: string
  lang: string
  selectionMode?: SelectionMode
  onSelectionDone?: (text: string | null) => void
  onContextMenuSelection?: (text: string, x: number, y: number) => void
}) {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  const getSelectedText = useCallback((): string | null => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !preRef.current) return null
    if (!preRef.current.contains(selection.anchorNode)) return null
    const text = selection.toString()
    return text && text.trim() ? text : null
  }, [])

  const handleMouseUp = useCallback(() => {
    if (selectionMode !== 'auto' || !onSelectionDone) return
    const text = getSelectedText()
    onSelectionDone(text)
  }, [selectionMode, onSelectionDone, getSelectedText])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (selectionMode !== 'menu' || !onContextMenuSelection) return
      const text = getSelectedText()
      if (!text) return
      e.preventDefault()
      onContextMenuSelection(text, e.clientX, e.clientY)
    },
    [selectionMode, onContextMenuSelection, getSelectedText],
  )

  return (
    <pre
      ref={preRef}
      className="p-4 pt-2"
      style={{
        fontSize: 12,
        backgroundColor: 'transparent',
        borderRadius: 0,
        margin: 0,
      }}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  )
}
