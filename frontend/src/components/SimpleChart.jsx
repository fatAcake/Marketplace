import { useMemo } from 'react'

/**
 * Простой SVG line chart без внешних зависимостей.
 *
 * @param {object[]} data  — массив точек [{ label, value }, ...]
 * @param {string}   color  — цвет линии (default: --navy)
 * @param {string}   label  — подпись оси Y
 */
export function SimpleChart({ data, color = '#111', label = '' }) {
  const svg = useMemo(() => {
    if (!data || data.length === 0) return null

    const W = 500
    const H = 220
    const pad = { top: 20, right: 20, bottom: 40, left: 55 }
    const cw = W - pad.left - pad.right
    const ch = H - pad.top - pad.bottom

    const values = data.map((d) => d.value)
    const minV = Math.min(...values, 0)
    const maxV = Math.max(...values, 1)
    const range = maxV - minV || 1

    const xStep = cw / Math.max(data.length - 1, 1)

    const points = data.map((d, i) => ({
      x: pad.left + i * xStep,
      y: pad.top + ch - ((d.value - minV) / range) * ch,
      label: d.label,
      value: d.value,
    }))

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaD = pathD + ` L${points[points.length - 1].x},${pad.top + ch} L${points[0].x},${pad.top + ch} Z`

    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const v = minV + (range * i) / 4
      const y = pad.top + ch - (i / 4) * ch
      return { v: Math.round(v * 100) / 100, y }
    })

    return { W, H, pad, cw, ch, pathD, areaD, points, yTicks }
  }, [data])

  if (!svg) {
    return <p className="text-navy">Нет данных для отображения</p>
  }

  const { W, H, pad, cw, ch, pathD, areaD, points, yTicks } = svg

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ width: '100%', maxWidth: W }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={t.y}
            x2={pad.left + cw}
            y2={t.y}
            stroke="var(--gray-400)"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
          <text x={pad.left - 6} y={t.y + 4} textAnchor="end" fontSize="11" fill="#111">
            {t.v}
          </text>
        </g>
      ))}

      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#111"
          transform={`rotate(-30, ${p.x}, ${H - 6})`}
        >
          {p.label}
        </text>
      ))}

      <path d={areaD} fill="url(#chartGrad)" />

      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
          <title>
            {p.label}: {p.value}
          </title>
        </g>
      ))}

      {label && (
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#111" transform={`rotate(-90, 12, ${H / 2})`}>
          {label}
        </text>
      )}
    </svg>
  )
}
