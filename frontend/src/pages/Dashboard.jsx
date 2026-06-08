import { Database, Hash, TrendingUp, AlertTriangle, Columns3, CircleDot } from 'lucide-react'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import ExportPDF from '../components/ExportPDF'

const SEVERITY_BG = { high: 'bg-rose-500/10 border-rose-500/25', medium: 'bg-amber-500/10 border-amber-500/25', low: 'bg-emerald-500/10 border-emerald-500/25' }
const SEVERITY_COLOR = { high: 'text-rose-400', medium: 'text-amber-400', low: 'text-emerald-400' }

function fmt(n) {
  if (n === undefined || n === null) return '—'
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function Dashboard({ data }) {
  if (!data) return null
  const { kpis, charts, trends, anomalies, preview } = data
  const numCols  = kpis?.numeric_columns || []
  const firstCol = numCols[0]
  const colStats = firstCol ? kpis?.columns?.[firstCol] : null

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Title + Export */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Overview</h2>
          <p className="text-ink-400 text-sm mt-1">Instant intelligence from your dataset</p>
        </div>
        <ExportPDF data={data} />
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Records"  value={fmt(kpis?.total_records)}  icon={Database}  color="brand" />
        <KpiCard title="Columns"        value={fmt(kpis?.total_columns)}  icon={Columns3}  color="cyan"  />
        <KpiCard title="Missing Values" value={fmt(kpis?.missing_values)} icon={CircleDot} color="amber" />
        <KpiCard title="Numeric Cols"   value={fmt(numCols.length)}       icon={Hash}      color="green" />
      </div>

      {/* Per-column KPIs */}
      {colStats && (
        <div>
          <h3 className="text-sm font-display font-semibold text-ink-300 uppercase tracking-wider mb-3">
            Column Stats — <span className="text-brand-400 normal-case font-mono">{firstCol}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard title="Sum"    value={fmt(colStats.sum)}    color="brand"  />
            <KpiCard title="Mean"   value={fmt(colStats.mean)}   color="cyan"   />
            <KpiCard title="Median" value={fmt(colStats.median)} color="violet" />
            <KpiCard title="Min"    value={fmt(colStats.min)}    color="green"  />
            <KpiCard title="Max"    value={fmt(colStats.max)}    color="amber"  />
          </div>
        </div>
      )}

      {/* Charts */}
      {charts?.length > 0 && (
        <div>
          <h3 className="text-sm font-display font-semibold text-ink-300 uppercase tracking-wider mb-3">Auto-Generated Charts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {charts.slice(0, 2).map((chart, i) => <ChartCard key={i} chart={chart} />)}
          </div>
        </div>
      )}

      {/* Trends + Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-4 border border-ink-700/50">
          <h3 className="text-sm font-display font-semibold text-ink-200 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-cyan" /> Trend Detection
          </h3>
          {trends?.length ? (
            <div className="space-y-2">
              {trends.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-ink-700/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{t.column}</p>
                      <p className="text-xs text-ink-400 capitalize">{t.direction} trend</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-semibold flex-shrink-0 ${t.pct_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.pct_change >= 0 ? '+' : ''}{t.pct_change.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-ink-500 text-sm">No trend data available.</p>}
        </div>

        <div className="glass rounded-xl p-4 border border-ink-700/50">
          <h3 className="text-sm font-display font-semibold text-ink-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent-amber" /> Anomaly Detection
          </h3>
          {anomalies?.length ? (
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 border ${SEVERITY_BG[a.severity]}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-white font-medium font-mono">{a.column}</span>
                    <span className={`text-xs font-semibold uppercase ${SEVERITY_COLOR[a.severity]}`}>{a.severity}</span>
                  </div>
                  <p className="text-xs text-ink-400">
                    {a.count} outliers ({a.pct_of_data}% of data) · range: [{a.lower_bound.toLocaleString()}, {a.upper_bound.toLocaleString()}]
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> No anomalies detected
            </p>
          )}
        </div>
      </div>

      {/* Data Preview */}
      {preview?.length > 0 && (
        <div className="glass rounded-xl border border-ink-700/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-700/50">
            <h3 className="text-sm font-display font-semibold text-ink-200">Data Preview (first 10 rows)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-ink-700/50">
                  {Object.keys(preview[0]).map(col => (
                    <th key={col} className="px-4 py-2 text-left text-ink-400 uppercase tracking-wide font-semibold whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-ink-700/20 hover:bg-ink-700/20 transition-colors">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-4 py-2 text-ink-300 whitespace-nowrap max-w-[180px] truncate">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
