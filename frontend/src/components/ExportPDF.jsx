import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { getRecommendations, getSummary } from '../utils/api'

function fmt(n) {
  if (n === undefined || n === null) return '—'
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function ExportPDF({ data }) {
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    if (!data) return
    setLoading(true)

    let insight = ''
    let recs = []
    try {
      const [sumRes, recRes] = await Promise.all([getSummary(), getRecommendations()])
      insight = sumRes.data.insight || ''
      recs    = recRes.data.recommendations || []
    } catch {}

    const { kpis, trends, anomalies, filename } = data
    const numCols = kpis?.numeric_columns || []
    const date    = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const colRows = numCols.map(col => {
      const s = kpis?.columns?.[col]
      return `<tr>
        <td>${col}</td>
        <td>${fmt(s?.sum)}</td>
        <td>${fmt(s?.mean)}</td>
        <td>${fmt(s?.min)}</td>
        <td>${fmt(s?.max)}</td>
        <td>${fmt(s?.count)}</td>
      </tr>`
    }).join('')

    const trendRows = (trends || []).map(t =>
      `<tr><td>${t.column}</td><td>${t.icon} ${t.direction}</td><td>${t.pct_change >= 0 ? '+' : ''}${t.pct_change}%</td></tr>`
    ).join('')

    const anomalyRows = (anomalies || []).map(a =>
      `<tr><td>${a.column}</td><td>${a.count} outliers</td><td>${a.pct_of_data}%</td><td class="sev-${a.severity}">${a.severity.toUpperCase()}</td></tr>`
    ).join('')

    const recCards = recs.map(r => `
      <div class="rec-card">
        <div class="rec-header">
          <span class="rec-title">${r.title}</span>
          <span class="badge badge-${r.priority}">${r.priority}</span>
        </div>
        <p>${r.description}</p>
        <span class="rec-cat">${r.category}</span>
      </div>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Talking Rabbitt Report — ${filename}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; color: #1a1a2e; background: white; }
  .page { max-width: 900px; margin: 0 auto; padding: 40px 48px; }
  .header { border-bottom: 3px solid #c340f5; padding-bottom: 20px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 28px; font-weight: 800; color: #c340f5; letter-spacing: -1px; }
  .logo span { color: #7b2fff; }
  .meta { text-align: right; color: #666; font-size: 13px; }
  .meta strong { display: block; font-size: 15px; color: #1a1a2e; }
  h2 { font-size: 16px; font-weight: 700; color: #c340f5; text-transform: uppercase; letter-spacing: 1px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e8e0f0; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
  .kpi { background: #f8f4ff; border: 1px solid #e0d0f8; border-radius: 8px; padding: 12px; }
  .kpi label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .5px; }
  .kpi .val { font-size: 22px; font-weight: 800; color: #7b2fff; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f0ebff; color: #5a2090; font-weight: 700; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0ebff; color: #333; }
  tr:last-child td { border-bottom: none; }
  .sev-high { color: #e63946; font-weight: 700; }
  .sev-medium { color: #f4a261; font-weight: 700; }
  .sev-low { color: #2a9d8f; font-weight: 700; }
  .insight-box { background: linear-gradient(135deg, #f8f4ff, #fff); border: 1px solid #d0b8f8; border-left: 4px solid #c340f5; border-radius: 8px; padding: 16px 20px; font-size: 14px; line-height: 1.7; color: #333; }
  .rec-card { border: 1px solid #e8e0f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .rec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .rec-title { font-weight: 700; font-size: 14px; color: #1a1a2e; }
  .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; }
  .badge-high { background: #ffe0e4; color: #c0002a; }
  .badge-medium { background: #fff4e0; color: #b06000; }
  .badge-low { background: #e0f8f0; color: #006644; }
  .rec-cat { font-size: 11px; color: #c340f5; text-transform: uppercase; font-weight: 600; margin-top: 6px; display: block; }
  .rec-card p { font-size: 13px; color: #555; line-height: 1.6; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e0f0; text-align: center; color: #aaa; font-size: 11px; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">Talking <span>Rabbitt</span></div>
      <div style="color:#888;font-size:13px;margin-top:4px">AI-Powered Business Intelligence Report</div>
    </div>
    <div class="meta">
      <strong>${filename}</strong>
      Generated ${date}
    </div>
  </div>

  <h2>Dataset Overview</h2>
  <div class="kpi-grid">
    <div class="kpi"><label>Total Records</label><div class="val">${fmt(kpis?.total_records)}</div></div>
    <div class="kpi"><label>Columns</label><div class="val">${fmt(kpis?.total_columns)}</div></div>
    <div class="kpi"><label>Numeric Cols</label><div class="val">${numCols.length}</div></div>
    <div class="kpi"><label>Missing Values</label><div class="val">${fmt(kpis?.missing_values)}</div></div>
  </div>

  ${numCols.length > 0 ? `
  <h2>Column Statistics</h2>
  <table>
    <thead><tr><th>Column</th><th>Sum</th><th>Mean</th><th>Min</th><th>Max</th><th>Count</th></tr></thead>
    <tbody>${colRows}</tbody>
  </table>` : ''}

  ${(trends || []).length > 0 ? `
  <h2>Trend Detection</h2>
  <table>
    <thead><tr><th>Column</th><th>Direction</th><th>Change</th></tr></thead>
    <tbody>${trendRows}</tbody>
  </table>` : ''}

  ${(anomalies || []).length > 0 ? `
  <h2>Anomaly Detection</h2>
  <table>
    <thead><tr><th>Column</th><th>Outliers</th><th>% of Data</th><th>Severity</th></tr></thead>
    <tbody>${anomalyRows}</tbody>
  </table>` : ''}

  ${insight ? `
  <h2>AI Executive Summary</h2>
  <div class="insight-box">${insight}</div>` : ''}

  ${recs.length > 0 ? `
  <h2>AI Business Recommendations</h2>
  ${recCards}` : ''}

  <div class="footer">Generated by Talking Rabbitt · AI Business Intelligence · ${date}</div>
</div>
</body>
</html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.onload = () => { win.focus(); win.print() }
    setLoading(false)
  }

  return (
    <button
      onClick={generateReport}
      disabled={loading || !data}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        bg-emerald-600/20 border border-emerald-500/30 text-emerald-300
        hover:bg-emerald-600/30 hover:border-emerald-400/50 transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Export PDF
    </button>
  )
}
