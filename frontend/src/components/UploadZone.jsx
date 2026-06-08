import { useCallback, useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle, Zap } from 'lucide-react'

export default function UploadZone({ onUpload, loading, error }) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }, [onUpload])

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = ()  => setDragging(false)

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* Hero text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/15 border border-brand-500/25 text-brand-300 text-xs font-mono mb-6">
            <Zap size={12} className="text-brand-400" />
            AI-Powered Business Intelligence
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Meet{' '}
            <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">
              Rabbitt
            </span>
            <br />
            <span className="text-ink-200 text-3xl md:text-4xl font-semibold">
              Your Data, Decoded
            </span>
          </h1>
          <p className="text-ink-300 text-lg max-w-lg mx-auto font-body">
            Upload any CSV or Excel file and Rabbitt instantly surfaces KPIs, trends, anomalies,
            forecasts, and AI-generated business recommendations.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !loading && fileRef.current?.click()}
          className={`
            relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
            transition-all duration-200
            ${dragging
              ? 'drop-zone-active border-brand-500 bg-brand-600/10'
              : 'border-ink-600/60 bg-ink-800/30 hover:border-brand-500/50 hover:bg-brand-600/5'
            }
            ${loading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-white font-semibold">Analyzing your data…</p>
                <p className="text-ink-400 text-sm mt-1">Rabbitt is crunching the numbers</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
                ${dragging
                  ? 'bg-brand-500/30 border border-brand-400/50 scale-110'
                  : 'bg-ink-700/60 border border-ink-600/40'
                }
              `}>
                <UploadCloud size={28} className={dragging ? 'text-brand-300' : 'text-ink-400'} />
              </div>

              <div>
                <p className="text-white font-semibold text-lg">
                  {dragging ? 'Drop it like it\'s hot 🔥' : 'Drop your file here'}
                </p>
                <p className="text-ink-400 text-sm mt-1">
                  or <span className="text-brand-400 underline">browse</span> to upload
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet size={12} className="text-accent-green" /> CSV
                </span>
                <span className="w-1 h-1 bg-ink-600 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet size={12} className="text-accent-amber" /> XLS / XLSX
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-sm animate-fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['KPI Detection', 'Auto Charts', 'Trend Analysis', 'Anomaly Detection', 'Forecasting', 'AI Chat', 'Recommendations'].map(f => (
            <span key={f} className="px-3 py-1 rounded-full text-xs text-ink-400 bg-ink-700/40 border border-ink-600/30 font-mono">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
