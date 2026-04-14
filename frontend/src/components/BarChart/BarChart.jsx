import { useMemo } from 'react'
import s from './BarChart.module.css'

/**
 * Горизонтальный bar chart.
 * @param {object[]} data — [{ label, value }, ...]
 * @param {string} color — цвет заливки графиков
 */
export function BarChart({ data, color = 'var(--navy)' }) {
  const bars = useMemo(() => {
    if (!data || data.length === 0) return null
    
    // Находим максимум, но не меньше 1, чтобы избежать деления на ноль
    const maxVal = Math.max(...data.map((d) => d.value), 1)
    
    return data.map((d) => ({
      ...d,
      // Минимальная ширина 2%, чтобы даже маленькие значения были видны
      pct: Math.max((d.value / maxVal) * 100, 2),
    }))
  }, [data])

  if (!bars || bars.length === 0) {
    return <p className={s.emptyText}>Нет данных для отображения</p>
  }

  return (
    <div className={s.barChart}>
      {bars.map((b, i) => (
        <div className={s.barRow} key={i}>
          <div className={s.barLabel} title={b.label}>
            {b.label}
          </div>
          <div className={s.barTrack}>
            <div
              className={s.barFill}
              style={{ 
                width: `${b.pct}%`, 
                backgroundColor: color 
              }}
            />
            <span className={s.barValue}>
              {typeof b.value === 'number' 
                ? Math.round(b.value).toLocaleString('ru-RU') 
                : b.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}