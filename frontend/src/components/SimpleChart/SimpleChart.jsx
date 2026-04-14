import { useMemo } from 'react'
import { calculateChartLayout } from './SimpleChart.utils'

export function SimpleChart({ data, color = '#111', label = '' }) {
  const layout = useMemo(() => calculateChartLayout(data), [data])

  if (!layout) {
    return <p className="text-navy">Нет данных для отображения</p>
  }

  const { W, H, pad, cw, pathD, areaD, points, yTicks } = layout

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ width: '100%', maxWidth: W }}>
      <defs>
        <ChartGradient id="chartGrad" color={color} />
      </defs>

      {/* Отрисовка сетки Y */}
      {yTicks.map((tick, i) => (
        <ChartYAxis key={i} tick={tick} xStart={pad.left} width={cw} />
      ))}

      {/* Подписи оси X */}
      {points.map((p, i) => (
        <XLabel key={i} p={p} H={H} />
      ))}

      {/* Геометрия графика */}
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Узловые точки */}
      {points.map((p, i) => (
        <ChartPoint key={i} p={p} color={color} />
      ))}

      {/* Название графика */}
      {label && <VerticalLabel label={label} H={H} />}
    </svg>
  )
}

// --- Вспомогательные компоненты (внутренние) ---

const ChartGradient = ({ id, color }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
  </linearGradient>
)

const ChartYAxis = ({ tick, xStart, width }) => (
  <g>
    <line x1={xStart} y1={tick.y} x2={xStart + width} y2={tick.y} 
          stroke="var(--gray-400)" strokeWidth="0.5" strokeDasharray="4,4" />
    <text x={xStart - 6} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#111">{tick.v}</text>
  </g>
)

const XLabel = ({ p, H }) => (
  <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#111" transform={`rotate(-30, ${p.x}, ${H - 6})`}>
    {p.label}
  </text>
)

const ChartPoint = ({ p, color }) => (
  <g>
    <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
    <title>{p.label}: {p.value}</title>
  </g>
)

const VerticalLabel = ({ label, H }) => (
  <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#111" transform={`rotate(-90, 12, ${H / 2})`}>
    {label}
  </text>
)