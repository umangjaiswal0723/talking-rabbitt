import { useState } from 'react'
import { Layers } from 'lucide-react'

export default function SheetSelector({ sheets, activeSheet, onSwitch, theme }) {
  const [pendingSheet, setPendingSheet] = useState(null)
  const light = theme === 'light'

  const handleTabClick = (sheet) => {
    if (sheet === activeSheet) return
    setPendingSheet(sheet)
    // Trigger file input
    document.getElementById('sheet-file-input').click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !pendingSheet) return
    onSwitch(file, pendingSheet)
    // Reset so same file can be selected again next time
    e.target.value = ''
    setPendingSheet(null)
  }

  return (
    <div className={`px-4 py-2 border-b flex items-center gap-3 overflow-x-auto
      ${light ? 'bg-white border-gray-100' : 'bg-ink-800/60 border-ink-700/50'}`}>

      {/* Hidden file input */}
      <input
        id="sheet-file-input"
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Layers size={13} className="text-brand-400" />
        <span className={`text-xs font-mono ${light ? 'text-gray-500' : 'text-ink-400'}`}>
          Sheets:
        </span>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {sheets.map((sheet) => (
          <button
            key={sheet}
            onClick={() => handleTabClick(sheet)}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono
              transition-all duration-150 border
              ${sheet === activeSheet
                ? 'bg-brand-600/30 border-brand-500/40 text-brand-300 cursor-default'
                : light
                  ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 cursor-pointer'
                  : 'bg-ink-700/40 border-ink-600/30 text-ink-400 hover:text-white hover:bg-brand-600/20 hover:border-brand-500/30 cursor-pointer'
              }
            `}
          >
            {sheet === activeSheet && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
            )}
            {sheet}
            {sheet === pendingSheet && (
              <span className="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Hint */}
      {pendingSheet && (
        <span className="text-xs text-brand-400 font-mono animate-pulse flex-shrink-0">
          ← now select your Excel file again
        </span>
      )}
    </div>
  )
}
