import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#c340f5', '#00e5ff', '#06d6a0', '#ffb703', '#ff4d6d', '#7b2fff', '#f4a261', '#2ec4b6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600/50 rounded-lg px-3 py-2 shadow-xl">
      {label !== undefined && <p className="text-ink-400 text-xs mb-1 font-mono">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || '#c340f5' }}>
          {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ChartCard({ chart }) {
  const { type, title, data, xKey, yKey } = chart

  const renderChart = () => {
    if (!data?.length) return (
      <div className="h-48 flex items-center justify-center text-ink-500 text-sm">No data available</div>
    )

    if (type === 'bar') return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            angle={-35}
            textAnchor="end"
            interval={0}
            tickLine={false}
          />
          <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={yKey} fill="#c340f5" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )

    if (type === 'line') return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey={xKey} tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="#00e5ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#00e5ff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    )

    if (type === 'pie') return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span style={{ color: '#8888aa', fontSize: 11 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    )

    return null
  }

  return (
    <div className="glass rounded-xl p-4 border border-ink-700/50 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-ink-200 truncate">{title}</h3>
        <span className="text-xs font-mono text-ink-500 uppercase px-2 py-0.5 bg-ink-700/50 rounded">
          {type}
        </span>
      </div>
      {renderChart()}
    </div>
  )
}
