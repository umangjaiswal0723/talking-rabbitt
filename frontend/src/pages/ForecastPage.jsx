import { useState, useEffect } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { getForecast } from '../utils/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600/50 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-ink-400 text-xs mb-1 font-mono">Point {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number'
            ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ForecastPage({ data }) {
  const numCols = data?.kpis?.numeric_columns || []
  const [selectedCol, setSelectedCol] = useState(numCols[0] || '')
  const [method, setMethod]           = useState('linear')
  const [steps, setSteps]             = useState(10)
  const [forecast, setForecast]       = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const runForecast = async () => {
    if (!selectedCol) return
    setLoading(true)
    setError(null)
    try {
      const res = await getForecast(selectedCol, method, steps)
      if (res.data.error) {
        setError(res.data.error)
        setForecast(null)
      } else {
        setForecast(res.data)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Forecast failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (selectedCol) runForecast() }, [selectedCol, method, steps])

  const chartData     = forecast?.combined || []
  const forecastStart = forecast?.historical?.length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Forecasting</h2>
        <p className="text-ink-400 text-sm mt-1">Moving average & linear regression projections</p>
      </div>

      {/* Controls */}
      <div className="glass rounded-xl p-4 border border-ink-700/50">
        <div className="flex flex-wrap gap-4 items-end">

          <div className="flex-1 min-w-40">
            <label className="text-xs text-ink-400 font-mono uppercase tracking-wide block mb-1.5">Column</label>
            <select value={selectedCol} onChange={e => setSelectedCol(e.target.value)}
              className="w-full bg-ink-700/60 border border-ink-600/50 rounded-lg px-3 py-2 text-sm text-white
                focus:outline-none focus:border-brand-500/60 font-mono">
              {numCols.length === 0
                ? <option value="">No numeric columns found</option>
                : numCols.map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-400 font-mono uppercase tracking-wide block mb-1.5">Method</label>
            <div className="flex rounded-lg overflow-hidden border border-ink-600/50">
              {[['linear', 'Linear Reg.'], ['moving_average', 'Moving Avg.']].map(([v, l]) => (
                <button key={v} onClick={() => setMethod(v)}
                  className={`px-3 py-2 text-xs font-mono transition-colors
                    ${method === v ? 'bg-brand-600/40 text-brand-300' : 'bg-ink-700/40 text-ink-400 hover:bg-ink-600/40'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-400 font-mono uppercase tracking-wide block mb-1.5">Steps</label>
            <select value={steps} onChange={e => setSteps(Number(e.target.value))}
              className="bg-ink-700/60 border border-ink-600/50 rounded-lg px-3 py-2 text-sm text-white
                focus:outline-none focus:border-brand-500/60 font-mono">
              {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button onClick={runForecast} disabled={loading || !selectedCol}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600/30 border border-brand-500/40
              text-brand-300 text-sm font-medium hover:bg-brand-600/50 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Run
          </button>
        </div>

        {/* Metrics row */}
        {forecast?.r2_score !== undefined && (
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-ink-700/30">
            <div>
              <p className="text-xs text-ink-500 font-mono">R² Score</p>
              <p className="text-xl font-display font-bold text-brand-300">{(forecast.r2_score * 100).toFixed(1)}%</p>
              <p className="text-xs text-ink-500">model fit</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 font-mono">Slope</p>
              <p className="text-xl font-display font-bold text-accent-cyan">{forecast.slope}</p>
              <p className="text-xs text-ink-500">per step</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 font-mono">Trend</p>
              <p className={`text-xl font-display font-bold ${forecast.trend === 'upward' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {forecast.trend === 'upward' ? '↑ Upward' : '↓ Downward'}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-500 font-mono">Forecast Steps</p>
              <p className="text-xl font-display font-bold text-amber-400">{steps}</p>
              <p className="text-xs text-ink-500">ahead</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 border border-rose-500/30 flex items-center gap-3">
          <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {/* Chart */}
      <div className="glass rounded-xl p-4 border border-ink-700/50">
        <h3 className="text-sm font-display font-semibold text-ink-200 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-accent-cyan" />
          {selectedCol} — {method === 'linear' ? 'Linear Regression' : 'Moving Average'} Forecast
        </h3>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false}
                label={{ value: 'Data Points →', position: 'insideBottomRight', fill: '#5a5a80', fontSize: 10, offset: -4 }} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: '#8888aa', fontSize: 11 }}>{v}</span>} />
              {forecastStart != null && (
                <ReferenceLine x={forecastStart - 1} stroke="#c340f5" strokeDasharray="4 4"
                  label={{ value: '▶ Forecast starts', fill: '#c340f5', fontSize: 10, position: 'top' }} />
              )}
              <Line type="monotone" dataKey="value" stroke="#00e5ff" strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload.type === 'forecast') {
                    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#c340f5" stroke="none" />
                  }
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={0} />
                }}
                activeDot={{ r: 4, fill: '#00e5ff' }} name="Value" />
              {method === 'linear' && (
                <Line type="monotone" dataKey="fitted" stroke="#c340f5" strokeWidth={1.5}
                  strokeDasharray="4 2" dot={false} name="Fitted line" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : !error ? (
          <div className="h-64 flex items-center justify-center text-ink-500 text-sm">
            Select a column and click Run to see forecast
          </div>
        ) : null}
      </div>

      {/* Interpretation guide */}
      {forecast && (
        <div className="glass rounded-xl p-4 border border-ink-700/50">
          <h3 className="text-xs font-mono text-ink-400 uppercase tracking-wide mb-3">How to read this chart</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-400">
            <div className="flex items-start gap-2">
              <span className="w-3 h-0.5 bg-cyan-400 mt-2 flex-shrink-0" />
              <span><strong className="text-cyan-400">Cyan line</strong> — actual historical values from your dataset</span>
            </div>
            {method === 'linear' && (
              <div className="flex items-start gap-2">
                <span className="w-3 h-0.5 bg-brand-400 mt-2 flex-shrink-0" style={{ borderTop: '2px dashed' }} />
                <span><strong className="text-brand-400">Purple dashed</strong> — best-fit regression line</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-brand-400">Purple dots</strong> — forecasted future values ({steps} steps ahead)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
