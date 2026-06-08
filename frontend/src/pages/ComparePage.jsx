import { useRef } from 'react'
import { Upload, GitCompare, BarChart3, TrendingUp, Database, ArrowRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

function fmt(n) {
  if (n === undefined || n === null) return '—'
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function StatRow({ label, valA, valB }) {
  const numA = parseFloat(valA)
  const numB = parseFloat(valB)
  const diff = (!isNaN(numA) && !isNaN(numB)) ? ((numB - numA) / (Math.abs(numA) + 1e-9) * 100) : null

  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-ink-700/20 last:border-0 text-sm">
      <span className="text-ink-400 font-mono text-xs">{label}</span>
      <span className="text-cyan-300 font-semibold text-center">{fmt(valA)}</span>
      <span className="text-brand-300 font-semibold text-center flex items-center justify-center gap-1">
        {fmt(valB)}
        {diff !== null && (
          <span className={`text-xs ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {diff >= 0 ? '▲' : '▼'}{Math.abs(diff).toFixed(1)}%
          </span>
        )}
      </span>
    </div>
  )
}

function UploadSlot({ label, color, onUpload, loading }) {
  const ref = useRef(null)
  return (
    <div
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
        ${color === 'cyan'
          ? 'border-cyan-500/40 hover:border-cyan-400/70 hover:bg-cyan-500/5'
          : 'border-brand-500/40 hover:border-brand-400/70 hover:bg-brand-500/5'
        }`}
    >
      <input ref={ref} type="file" accept=".csv,.xls,.xlsx" className="hidden"
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      <Upload size={28} className={`mx-auto mb-3 ${color === 'cyan' ? 'text-cyan-400' : 'text-brand-400'}`} />
      <p className="text-white font-semibold">{label}</p>
      <p className="text-ink-400 text-xs mt-1">CSV or Excel</p>
    </div>
  )
}

export default function ComparePage({ dataA, dataB, onUploadB, loading }) {
  // Build comparison chart for shared numeric columns
  const buildCompareChart = () => {
    if (!dataA || !dataB) return []
    const colsA = dataA.kpis?.numeric_columns || []
    const colsB = dataB.kpis?.numeric_columns || []
    const shared = colsA.filter(c => colsB.includes(c)).slice(0, 6)
    return shared.map(col => ({
      col,
      [dataA.filename]: dataA.kpis?.columns?.[col]?.mean || 0,
      [dataB.filename]: dataB.kpis?.columns?.[col]?.mean || 0,
    }))
  }

  const chartData   = buildCompareChart()
  const colsA       = dataA?.kpis?.numeric_columns || []
  const colsB       = dataB?.kpis?.numeric_columns || []
  const sharedCols  = colsA.filter(c => colsB.includes(c))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Compare Datasets</h2>
        <p className="text-ink-400 text-sm mt-1">Upload two files and compare them side by side</p>
      </div>

      {/* Upload slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File A */}
        <div className="glass rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 font-bold">A</span>
            <span className="text-sm font-semibold text-cyan-300">Dataset A {dataA ? `— ${dataA.filename}` : '(Primary)'}</span>
          </div>
          {dataA ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs text-ink-400">Records</p>
                <p className="text-xl font-display font-bold text-cyan-300">{fmt(dataA.kpis?.total_records)}</p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs text-ink-400">Columns</p>
                <p className="text-xl font-display font-bold text-cyan-300">{fmt(dataA.kpis?.total_columns)}</p>
              </div>
            </div>
          ) : (
            <p className="text-ink-500 text-sm">Upload a file from the header to load Dataset A</p>
          )}
        </div>

        {/* File B */}
        <div className="glass rounded-xl p-4 border border-brand-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-xs text-brand-400 font-bold">B</span>
            <span className="text-sm font-semibold text-brand-300">Dataset B {dataB ? `— ${dataB.filename}` : '(Compare)'}</span>
          </div>
          {dataB ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-500/10 rounded-lg p-3 border border-brand-500/20">
                <p className="text-xs text-ink-400">Records</p>
                <p className="text-xl font-display font-bold text-brand-300">{fmt(dataB.kpis?.total_records)}</p>
              </div>
              <div className="bg-brand-500/10 rounded-lg p-3 border border-brand-500/20">
                <p className="text-xs text-ink-400">Columns</p>
                <p className="text-xl font-display font-bold text-brand-300">{fmt(dataB.kpis?.total_columns)}</p>
              </div>
            </div>
          ) : (
            <UploadSlot label="Upload Dataset B" color="brand" onUpload={onUploadB} loading={loading} />
          )}
        </div>
      </div>

      {/* Side-by-side stats */}
      {dataA && dataB && sharedCols.length > 0 && (
        <div className="glass rounded-xl p-4 border border-ink-700/50">
          <h3 className="text-sm font-display font-semibold text-ink-200 mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-accent-cyan" />
            Column Comparison (shared numeric columns)
          </h3>

          {/* Header */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-ink-700/40 mb-1">
            <span className="text-xs text-ink-500 font-mono uppercase">Column</span>
            <span className="text-xs text-cyan-400 font-mono uppercase text-center">A — {dataA.filename?.split('.')[0]}</span>
            <span className="text-xs text-brand-400 font-mono uppercase text-center">B — {dataB.filename?.split('.')[0]}</span>
          </div>

          {sharedCols.map(col => {
            const a = dataA.kpis?.columns?.[col]
            const b = dataB.kpis?.columns?.[col]
            return (
              <div key={col} className="mb-4">
                <p className="text-xs text-white font-semibold font-mono mb-1 mt-3">{col}</p>
                <StatRow label="Sum"    valA={a?.sum}    valB={b?.sum} />
                <StatRow label="Mean"   valA={a?.mean}   valB={b?.mean} />
                <StatRow label="Max"    valA={a?.max}    valB={b?.max} />
                <StatRow label="Min"    valA={a?.min}    valB={b?.min} />
              </div>
            )
          })}
        </div>
      )}

      {/* Comparison bar chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-xl p-4 border border-ink-700/50">
          <h3 className="text-sm font-display font-semibold text-ink-200 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-accent-amber" />
            Mean Values Comparison
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="col" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ color: '#8888aa', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey={dataA.filename} fill="#00e5ff" radius={[4,4,0,0]} />
              <Bar dataKey={dataB.filename} fill="#c340f5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Prompt to upload */}
      {(!dataA || !dataB) && (
        <div className="glass rounded-xl p-8 text-center border border-ink-700/50">
          <GitCompare size={36} className="text-ink-500 mx-auto mb-3" />
          <p className="text-ink-300 font-semibold mb-1">
            {!dataA ? 'Upload Dataset A from the header first' : 'Now upload Dataset B above to compare'}
          </p>
          <p className="text-ink-500 text-sm">You can compare sales reports, monthly data, different teams, etc.</p>
        </div>
      )}
    </div>
  )
}
