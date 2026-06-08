import { useState } from 'react'
import ChartCard from '../components/ChartCard'
import ColumnSelector from '../components/ColumnSelector'
import { BarChart3 } from 'lucide-react'

export default function ChartsPage({ data }) {
  const charts    = data?.charts || []
  const numCols   = data?.kpis?.numeric_columns || []
  const [selected, setSelected] = useState(numCols)

  // Filter charts to only show selected columns
  const filtered = charts.filter(c => {
    if (!c.yKey) return true  // pie chart etc
    return selected.includes(c.yKey)
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Charts</h2>
          <p className="text-ink-400 text-sm mt-1">Auto-generated visualizations · filter by column</p>
        </div>
        {numCols.length > 0 && (
          <ColumnSelector columns={numCols} selected={selected} onSelect={setSelected} />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-ink-700/50">
          <BarChart3 size={40} className="text-ink-500 mx-auto mb-3" />
          <p className="text-ink-400">No charts match the selected columns</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((chart, i) => (
            <ChartCard key={i} chart={chart} />
          ))}
        </div>
      )}
    </div>
  )
}
