import { useState } from 'react';

/* Lightweight, dependency-free charts (pure SVG + CSS). Each is fully prop-driven
   and theme-aware. Colors accept a hex, a CSS var()/rgb(), or an AstralUI palette
   token like "violet.6" (mapped to var(--astral-color-violet-6)). */

/** "violet.6" -> var(--astral-color-violet-6); hex / var() / rgb() pass through. */
export function chartColor(c: string): string {
  if (c.startsWith('var(') || c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl')) return c;
  return `var(--astral-color-${c.replace('.', '-')})`;
}

/** Tiny inline SVG sparkline for KPI cards. */
export function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2 || points.every(p => p === 0)) return null;
  const w = 100, h = 28;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="au-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={chartColor(color)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Period-over-period delta badge; renders nothing when there's no comparison. */
export function Delta({ current, previous }: { current: number; previous: number | null | undefined }) {
  if (previous == null || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return <span className={`au-delta ${up ? 'up' : 'down'}`}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>;
}

export interface DonutDatum { name: string; value: number; color: string; }

/** Interactive donut with a linked side-legend (ring slice <-> legend row hover). */
export function Donut({ data, centerValue, centerLabel }: {
  data: DonutDatum[];
  centerValue: string;
  centerLabel: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const c = 75, r = 58, sw = 18, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="au-donut">
      <div className="au-donut-ring">
        <svg width={150} height={150} viewBox="0 0 150 150">
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--au-surface-2)" strokeWidth={sw} />
          {data.map((d, i) => {
            const dash = (d.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={c} cy={c} r={r} fill="none"
                stroke={chartColor(d.color)}
                strokeWidth={hovered === i ? sw + 4 : sw}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${c} ${c})`}
                style={{
                  opacity: hovered == null || hovered === i ? 1 : 0.28,
                  transition: 'opacity .15s, stroke-width .15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="au-donut-ctr"><b>{centerValue}</b><span>{centerLabel}</span></div>
      </div>
      <div className="au-donut-legend">
        {data.map((d, i) => (
          <div
            key={i}
            className={`au-dl ${hovered === i ? 'on' : hovered != null ? 'off' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="dot" style={{ background: chartColor(d.color) }} />
            <b>{d.value.toLocaleString()}</b>
            <span className="dll">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface FunnelDatum { stage: string; value: number; color: string; }

/** Horizontal funnel/pipeline bars; hovering a bar highlights it and dims the rest. */
export function FunnelBars({ data }: { data: FunnelDatum[] }) {
  const [hov, setHov] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="au-funnel">
      {data.map((d, i) => (
        <div
          key={d.stage}
          className={`au-fbar ${hov === i ? 'on' : hov != null ? 'off' : ''}`}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
        >
          <span className="au-fbar-label">{d.stage}</span>
          <div className="au-fbar-track">
            <div className="au-fbar-fill" style={{ width: `${(d.value / max) * 100}%`, background: chartColor(d.color) }} />
          </div>
          <span className="au-fbar-val">{d.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export interface StackedRow { label: string; values: number[]; }
export interface StackedSeries { label: string; color: string; }

/** Stacked horizontal bars with linked hover: hover a legend series OR a segment
 *  to highlight it across every row (others dim). Values are always shown. */
export function StackedBars({ rows, series }: { rows: StackedRow[]; series: StackedSeries[] }) {
  const [hovSeries, setHovSeries] = useState<number | null>(null);
  const [hovSeg, setHovSeg] = useState<{ row: number; s: number } | null>(null);
  const max = Math.max(...rows.map(r => r.values.reduce((a, b) => a + b, 0)), 1);
  const anyHover = hovSeries != null || hovSeg != null;
  const active = (row: number, s: number) =>
    hovSeries != null ? s === hovSeries
      : hovSeg != null ? hovSeg.row === row && hovSeg.s === s
        : true;
  return (
    <div className="au-usage">
      <div className="au-usage-legend">
        {series.map((s, si) => (
          <div
            key={si}
            className={`au-ulg ${hovSeries === si ? 'on' : hovSeries != null ? 'off' : ''}`}
            onMouseEnter={() => setHovSeries(si)}
            onMouseLeave={() => setHovSeries(null)}
          >
            <span className="dot" style={{ background: chartColor(s.color) }} />{s.label}
          </div>
        ))}
      </div>
      <div className="au-usage-rows">
        {rows.map((r, i) => (
          <div key={i} className={`au-urow ${hovSeg?.row === i ? 'on' : ''}`}>
            <span className="au-urow-label" title={r.label}>{r.label}</span>
            <div className="au-utrack">
              {r.values.map((v, si) => (
                <div
                  key={si}
                  className="au-useg"
                  onMouseEnter={() => setHovSeg({ row: i, s: si })}
                  onMouseLeave={() => setHovSeg(null)}
                  style={{
                    width: `${(v / max) * 100}%`,
                    background: chartColor(series[si].color),
                    opacity: anyHover && !active(i, si) ? 0.2 : 1,
                    filter: anyHover && active(i, si) ? 'brightness(1.2)' : undefined,
                  }}
                />
              ))}
            </div>
            <span className="au-unums">
              {r.values.map((v, si) => (
                <b
                  key={si}
                  style={{
                    color: chartColor(series[si].color),
                    opacity: anyHover && !active(i, si) ? 0.28 : 1,
                    textShadow: anyHover && active(i, si) ? `0 0 10px ${chartColor(series[si].color)}` : undefined,
                  }}
                >{v.toLocaleString()}</b>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
