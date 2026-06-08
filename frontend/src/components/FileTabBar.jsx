import { X, FileSpreadsheet, Plus } from 'lucide-react'
import { useRef } from 'react'

export default function FileTabBar({ loadedFiles, activeFile, onSwitch, onUpload, onRemove, theme }) {
  const fileRef = useRef(null)
  const light   = theme === 'light'

  if (!loadedFiles || loadedFiles.length === 0) return null

  return (
    <div className={`px-3 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto
      ${light ? 'bg-gray-50 border-gray-200' : 'bg-ink-800/80 border-ink-700/50'}`}>

      {/* File tabs */}
      {loadedFiles.map((filename) => {
        const isActive  = filename === activeFile
        const shortName = filename.length > 22
          ? filename.substring(0, 20) + '…'
          : filename

        return (
          <div
            key={filename}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono
              border transition-all duration-150 flex-shrink-0 group
              ${isActive
                ? 'bg-brand-600/30 border-brand-500/40 text-brand-300'
                : light
                  ? 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 cursor-pointer'
                  : 'bg-ink-700/40 border-ink-600/30 text-ink-400 hover:text-white hover:bg-brand-600/15 hover:border-brand-500/30 cursor-pointer'
              }
            `}
            onClick={() => !isActive && onSwitch(filename)}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />}
            <FileSpreadsheet size={11} className={isActive ? 'text-brand-400' : 'text-ink-500'} />
            <span title={filename}>{shortName}</span>

            {loadedFiles.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(filename) }}
                className={`
                  w-3.5 h-3.5 rounded-full flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity ml-0.5
                  ${light
                    ? 'hover:bg-red-100 text-gray-400 hover:text-red-500'
                    : 'hover:bg-rose-500/20 text-ink-500 hover:text-rose-400'
                  }
                `}
                title={`Remove ${filename}`}
              >
                <X size={9} />
              </button>
            )}
          </div>
        )
      })}

      {/* Add file button */}
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) { onUpload(e.target.files[0]); e.target.value = '' } }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        title="Add another file"
        className={`
          flex items-center gap-1 px-2 py-1 rounded-lg text-xs border
          transition-all duration-150 flex-shrink-0
          ${light
            ? 'bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'
            : 'bg-ink-700/30 border-ink-600/30 text-ink-500 hover:text-brand-300 hover:border-brand-500/30'
          }
        `}
      >
        <Plus size={11} />
        <span className="font-mono">Add file</span>
      </button>
    </div>
  )
}
