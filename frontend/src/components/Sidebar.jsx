import { LayoutDashboard, BarChart3, TrendingUp, Lightbulb, MessageCircle, X, Upload, GitCompare } from 'lucide-react'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard',     requiresData: true  },
  { id: 'charts',    icon: BarChart3,       label: 'Charts',         requiresData: true  },
  { id: 'forecast',  icon: TrendingUp,      label: 'Forecast',       requiresData: true  },
  { id: 'insights',  icon: Lightbulb,       label: 'AI Insights',    requiresData: true  },
  { id: 'chat',      icon: MessageCircle,   label: 'Ask Rabbitt',    requiresData: false },
  { id: 'compare',   icon: GitCompare,      label: 'Compare Files',  requiresData: false },
]

export default function Sidebar({ activePage, setActivePage, hasData, filename, isOpen, setIsOpen, theme }) {
  const light = theme === 'light'
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`
        fixed md:relative z-30 md:z-auto h-full flex flex-col
        border-r transition-all duration-300 ease-in-out
        ${light ? 'bg-white border-gray-200' : 'glass border-ink-700/50'}
        ${isOpen ? 'w-60 translate-x-0' : 'w-60 -translate-x-full md:w-16 md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b ${light ? 'border-gray-100' : 'border-ink-700/50'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center flex-shrink-0 glow-brand">
            <span className="text-white font-display font-bold text-sm">R</span>
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className={`font-display font-bold text-sm whitespace-nowrap ${light ? 'text-gray-900' : 'text-white'}`}>Talking Rabbitt</p>
              <p className={`text-xs whitespace-nowrap ${light ? 'text-gray-500' : 'text-ink-300'}`}>Business Intelligence</p>
            </div>
          )}
          <button onClick={() => setIsOpen(false)} className={`ml-auto md:hidden ${light ? 'text-gray-400' : 'text-ink-400'}`}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label, requiresData }) => {
            const disabled = requiresData && !hasData
            const active   = activePage === id
            return (
              <button
                key={id}
                onClick={() => !disabled && (setActivePage(id), setIsOpen(false))}
                disabled={disabled}
                title={!isOpen ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                    : disabled
                      ? `${light ? 'text-gray-300' : 'text-ink-500'} cursor-not-allowed opacity-40`
                      : light
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                        : 'text-ink-300 hover:text-white hover:bg-ink-700/50 cursor-pointer'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {isOpen && <span className="truncate">{label}</span>}
                {active && isOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                {!isOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-ink-700 text-white text-xs rounded
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {hasData && isOpen && (
          <div className={`p-3 m-3 rounded-lg border ${light ? 'bg-gray-50 border-gray-200' : 'bg-ink-700/40 border-ink-600/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Upload size={12} className="text-accent-green" />
              <span className={`text-xs font-mono ${light ? 'text-gray-500' : 'text-ink-300'}`}>Dataset loaded</span>
            </div>
            <p className={`text-xs font-medium truncate ${light ? 'text-gray-800' : 'text-white'}`}>{filename}</p>
          </div>
        )}

        {isOpen && (
          <div className={`px-4 py-3 border-t ${light ? 'border-gray-100 text-gray-400' : 'border-ink-700/50 text-ink-500'}`}>
            <p className="text-xs font-mono">v2.0.0 — Hackathon MVP</p>
          </div>
        )}
      </aside>
    </>
  )
}
