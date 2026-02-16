import { CodeView } from './code-view'
import { Button } from './ui/button'
import { CopyButton } from './ui/copy-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { clampSelection, isSelectionTooLarge } from '@/lib/selection-context'
import type { CodeSelection, SelectionMode } from '@/lib/selection-context'
import { Download, FileText } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

type ContextMenu = {
  x: number
  y: number
  text: string
}

export function FragmentCode({
  files,
  selectionMode = 'auto',
  onAttachSelection,
}: {
  files: { name: string; content: string }[]
  selectionMode?: SelectionMode
  onAttachSelection?: (selection: CodeSelection) => void
}) {
  const [currentFile, setCurrentFile] = useState(files[0].name)
  const [menu, setMenu] = useState<ContextMenu | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentFileContent = files.find(
    (file) => file.name === currentFile,
  )?.content

  useEffect(() => {
    if (!menu) return
    function dismiss(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null)
      }
    }
    document.addEventListener('mousedown', dismiss)
    return () => document.removeEventListener('mousedown', dismiss)
  }, [menu])

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  function buildSelection(raw: string): CodeSelection | null {
    if (isSelectionTooLarge(raw)) {
      toast({ title: 'Selection too large', description: 'Max ~16 KB. Select a smaller range.', variant: 'destructive' })
      return null
    }
    const clamped = clampSelection(raw)
    if (!clamped) return null
    const lang = currentFile.split('.').pop() || ''
    return { fileName: currentFile, lang, text: clamped }
  }

  function handleSelectionDone(raw: string | null) {
    if (!raw || !onAttachSelection) return
    const sel = buildSelection(raw)
    if (sel) onAttachSelection(sel)
  }

  const handleContextMenuSelection = useCallback(
    (text: string, x: number, y: number) => {
      setMenu({ x, y, text })
    },
    [],
  )

  function handleMenuAttach() {
    if (!menu || !onAttachSelection) return
    const sel = buildSelection(menu.text)
    if (sel) onAttachSelection(sel)
    setMenu(null)
  }

  function handleMenuCopy() {
    if (!menu) return
    navigator.clipboard.writeText(menu.text)
    toast({ title: 'Copied to clipboard' })
    setMenu(null)
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center px-2 pt-1 gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.name}
              className={`flex gap-2 select-none cursor-pointer items-center text-sm text-muted-foreground px-2 py-1 rounded-md hover:bg-muted border ${
                file.name === currentFile ? 'bg-muted border-muted' : ''
              }`}
              onClick={() => setCurrentFile(file.name)}
            >
              <FileText className="h-4 w-4" />
              {file.name}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <CopyButton
                  content={currentFileContent || ''}
                  className="text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() =>
                    download(currentFile, currentFileContent || '')
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-x-auto">
        <CodeView
          code={currentFileContent || ''}
          lang={currentFile.split('.').pop() || ''}
          selectionMode={selectionMode}
          onSelectionDone={handleSelectionDone}
          onContextMenuSelection={handleContextMenuSelection}
        />
      </div>

      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-lg border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={handleMenuAttach}
          >
            Attach as context
          </button>
          <button
            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={handleMenuCopy}
          >
            Copy selection
          </button>
        </div>
      )}
    </div>
  )
}
