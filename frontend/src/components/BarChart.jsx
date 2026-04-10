import { useMemo } from 'react'

/**
 * Горизонтальный bar chart.
 * @param {object[]} data — [{ label, value }, ...]
 * @param {string} color
 */
export function BarChart({ data, color = 'var(--navy)' }) {
  const bars = useMemo(() => {
    if (!data || data.length === 0) return null
    const maxVal = Math.max(...data.map((d) => d.value), 1)
    return data.map((d) => ({
      ...d,
      pct: Math.max((d.value / maxVal) * 100, 2),
    }))
  }, [data])

  if (!bars || bars.length === 0) {
    return <p className="text-navy">Нет данных для отображения</p>
  }

  return (
    <div className="bar-chart">
      {bars.map((b, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-label" title={b.label}>{b.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${b.pct}%`, background: color }}
            />
            <span className="bar-value">{typeof b.value === 'number' ? Math.round(b.value).toLocaleString('ru-RU') : b.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
