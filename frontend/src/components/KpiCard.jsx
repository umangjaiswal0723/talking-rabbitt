export default function KpiCard({ title, value, sub, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:  { bg: 'bg-brand-600/15',   border: 'border-brand-500/25',   text: 'text-brand-300',   icon: 'text-brand-400'  },
    cyan:   { bg: 'bg-cyan-600/15',    border: 'border-cyan-500/25',    text: 'text-cyan-300',    icon: 'text-cyan-400'   },
    amber:  { bg: 'bg-amber-600/15',   border: 'border-amber-500/25',   text: 'text-amber-300',   icon: 'text-amber-400'  },
    green:  { bg: 'bg-emerald-600/15', border: 'border-emerald-500/25', text: 'text-emerald-300', icon: 'text-emerald-400'},
    rose:   { bg: 'bg-rose-600/15',    border: 'border-rose-500/25',    text: 'text-rose-300',    icon: 'text-rose-400'   },
    violet: { bg: 'bg-violet-600/15',  border: 'border-violet-500/25',  text: 'text-violet-300',  icon: 'text-violet-400' },
  }
  const c = colors[color] || colors.brand

  return (
    <div className={`glass glass-hover rounded-xl p-4 border ${c.border} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          {Icon && <Icon size={16} className={c.icon} />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-ink-400 text-xs font-body uppercase tracking-wider mb-1">{title}</p>
      <p className={`font-display font-bold text-2xl ${c.text} leading-none`}>{value}</p>
      {sub && <p className="text-ink-500 text-xs mt-1 font-mono truncate">{sub}</p>}
    </div>
  )
}
