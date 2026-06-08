import { useState } from 'react'
import { SlidersHorizontal, Check } from 'lucide-react'

export default function ColumnSelector({ columns = [], selected, onSelect }) {
  const [open, setOpen] = useState(false)

  const toggle = (col) => {
    if (selected.includes(col)) {
      if (selected.length > 1) onSelect(selected.filter(c => c !== col))
    } else {
      onSelect([...selected, col])
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          bg-ink-700/40 border border-ink-600/40 text-ink-300 hover:text-white hover:border-brand-500/40
          transition-all duration-150"
      >
        <SlidersHorizontal size={14} />
        Columns
        <span className="w-5 h-5 rounded-full bg-brand-600/40 text-brand-300 text-xs flex items-center justify-center">
          {selected.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 glass border border-ink-700/50 rounded-xl p-2 min-w-48 shadow-xl">
            <p className="text-xs text-ink-500 font-mono uppercase px-2 py-1 mb-1">Select columns to chart</p>
            {columns.map(col => (
              <button
                key={col}
                onClick={() => toggle(col)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-300
                  hover:text-white hover:bg-ink-700/50 transition-colors"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                  ${selected.includes(col) ? 'bg-brand-600/50 border-brand-500/60' : 'border-ink-600/50'}`}>
                  {selected.includes(col) && <Check size={10} className="text-brand-300" />}
                </div>
                <span className="font-mono truncate">{col}</span>
              </button>
            ))}
            <div className="border-t border-ink-700/40 mt-2 pt-2 px-2 flex gap-2">
              <button onClick={() => onSelect(columns)} className="text-xs text-brand-400 hover:text-brand-300">All</button>
              <span className="text-ink-600">·</span>
              <button onClick={() => onSelect(columns.slice(0, 1))} className="text-xs text-ink-400 hover:text-white">Reset</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
