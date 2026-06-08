import { useState, useRef } from 'react'
import { Menu, Upload, RefreshCw, Sparkles, Sun, Moon } from 'lucide-react'

export default function Header({ filename, onUpload, loading, hasData, sidebarOpen, setSidebarOpen, theme, setTheme }) {
  const fileRef = useRef(null)
  const light = theme === 'light'

  return (
    <header className={`border-b px-4 md:px-6 py-3 flex items-center gap-4 ${light ? 'bg-white border-gray-200' : 'glass border-ink-700/50'}`}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`p-1 rounded transition-colors ${light ? 'text-gray-400 hover:text-gray-700' : 'text-ink-400 hover:text-white'}`}>
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Sparkles size={16} className="text-brand-400 flex-shrink-0" />
        <span className={`font-display font-semibold text-sm hidden sm:block ${light ? 'text-gray-900' : 'text-white'}`}>
          Talking Rabbitt
        </span>
        {filename && (
          <>
            <span className={`hidden sm:block ${light ? 'text-gray-300' : 'text-ink-500'}`}>/</span>
            <span className={`text-sm font-mono truncate hidden sm:block ${light ? 'text-gray-500' : 'text-ink-300'}`}>{filename}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {loading && (
          <div className="flex items-center gap-2 text-brand-400 text-sm">
            <RefreshCw size={14} className="animate-spin" />
            <span className="hidden sm:block text-xs">Processing…</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(light ? 'dark' : 'light')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border
            ${light
              ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              : 'bg-ink-700/40 border-ink-600/40 text-ink-300 hover:text-white hover:bg-ink-600/40'
            }`}
          title={light ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {light ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-brand-600/20 border border-brand-500/30 text-brand-300
            hover:bg-brand-600/30 hover:border-brand-400/50 transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={14} />
          <span className="hidden sm:block">{hasData ? 'Replace' : 'Upload'}</span>
        </button>
      </div>
    </header>
  )
}
