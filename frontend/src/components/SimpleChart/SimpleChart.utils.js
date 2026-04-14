/**
 * Расчитывает координаты и параметры SVG для графика.
 */
export const calculateChartLayout = (data, options = {}) => {
  if (!data || data.length === 0) return null;

  const {
    width: W = 500,
    height: H = 220,
    padding: pad = { top: 20, right: 20, bottom: 40, left: 55 }
  } = options;

  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 1);
  const range = maxV - minV || 1;

  const xStep = cw / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + ch - ((d.value - minV) / range) * ch,
    label: d.label,
    value: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${pad.top + ch} L${points[0].x},${pad.top + ch} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const v = minV + (range * i) / 4;
    const y = pad.top + ch - (i / 4) * ch;
    return { v: Math.round(v * 100) / 100, y };
  });

  return { W, H, pad, cw, ch, pathD, areaD, points, yTicks };
};