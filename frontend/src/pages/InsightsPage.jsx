import { useState, useEffect } from 'react'
import { Lightbulb, RefreshCw, Target, Zap, TrendingUp, Shield, Users, DollarSign, AlertCircle } from 'lucide-react'
import { getRecommendations, getSummary } from '../utils/api'

const CATEGORY_CONFIG = {
  revenue:    { icon: DollarSign, color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/25'   },
  operations: { icon: Zap,        color: 'text-cyan-400',    bg: 'bg-cyan-500/10    border-cyan-500/25'    },
  risk:       { icon: Shield,     color: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/25'    },
  growth:     { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  customer:   { icon: Users,      color: 'text-violet-400',  bg: 'bg-violet-500/10  border-violet-500/25'  },
}

const PRIORITY_COLOR = {
  high:   'text-rose-400   bg-rose-500/10   border-rose-500/30',
  medium: 'text-amber-400  bg-amber-500/10  border-amber-500/30',
  low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}

export default function InsightsPage({ data }) {
  const [recs, setRecs]       = useState([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [recRes, sumRes] = await Promise.all([
        getRecommendations(),
        getSummary(),
      ])
      setRecs(recRes.data.recommendations || [])
      setSummary(sumRes.data.insight || '')
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Failed to load AI insights.'
      setError(`${msg} — Make sure your GROQ_API_KEY is set in backend/.env`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (data) load() }, [data])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">AI Insights</h2>
          <p className="text-ink-400 text-sm mt-1">Powered by Groq — business recommendations & executive summary</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-brand-600/20 border border-brand-500/30 text-brand-300
            hover:bg-brand-600/30 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 border border-rose-500/30 flex items-start gap-3 animate-fade-in">
          <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {/* Executive Summary */}
      {(summary || loading) && !error && (
        <div className="glass rounded-xl p-5 border border-brand-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-brand-600/25 border border-brand-500/30 flex items-center justify-center">
              <Lightbulb size={14} className="text-brand-400" />
            </div>
            <h3 className="text-sm font-display font-semibold text-brand-300">Executive Summary</h3>
            <span className="text-xs text-ink-500 font-mono ml-1">by Rabbitt AI</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[100, 90, 75].map(w => (
                <div key={w} className="h-4 shimmer-bg rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <p className="text-ink-200 text-sm leading-relaxed font-body">{summary}</p>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-display font-semibold text-ink-300 uppercase tracking-wider mb-3">
          Business Recommendations
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass rounded-xl p-5 border border-ink-700/50 space-y-3">
                <div className="h-4 shimmer-bg rounded w-1/2" />
                <div className="space-y-1.5">
                  <div className="h-3 shimmer-bg rounded w-full" />
                  <div className="h-3 shimmer-bg rounded w-5/6" />
                  <div className="h-3 shimmer-bg rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : recs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recs.map((rec, i) => {
              const cfg  = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.operations
              const Icon = cfg.icon
              return (
                <div key={i} className="glass glass-hover rounded-xl p-5 border animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[rec.priority] || PRIORITY_COLOR.medium}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-white text-sm mb-2">{rec.title}</h4>
                  <p className="text-ink-300 text-xs leading-relaxed font-body">{rec.description}</p>
                  <div className="mt-3 pt-3 border-t border-ink-700/30">
                    <span className={`text-xs font-mono ${cfg.color} uppercase tracking-wide`}>{rec.category}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : !loading && !error ? (
          <div className="glass rounded-xl p-8 text-center border border-ink-700/50">
            <Target size={32} className="text-ink-500 mx-auto mb-2" />
            <p className="text-ink-400 text-sm">No recommendations loaded yet — click Refresh</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
