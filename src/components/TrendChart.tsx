'use client';

import { BiomarkerHistory } from '@/types/biomarker';

interface TrendChartProps {
  history: BiomarkerHistory;
  width?: number;
  height?: number;
}

export default function TrendChart({ history, width = 200, height = 100 }: TrendChartProps) {
  if (!history || history.entries.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-border bg-gray-50 text-xs text-muted"
        style={{ width, height }}
      >
        No trend data
      </div>
    );
  }

  // Sort entries by timestamp
  const sortedEntries = [...history.entries].sort((a, b) => a.timestamp - b.timestamp);

  if (sortedEntries.length < 2) {
    return (
      <div
        className="flex items-center justify-center border border-border bg-gray-50 text-xs text-muted"
        style={{ width, height }}
      >
        Need 2+ reports
      </div>
    );
  }

  const values = sortedEntries.map(e => e.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Calculate SVG path points
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = sortedEntries.map((entry, index) => {
    const x = padding + (index / (sortedEntries.length - 1)) * chartWidth;
    const y = padding + ((maxValue - entry.value) / valueRange) * chartHeight;
    return { x, y, entry };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Determine trend color based on latest classification
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const trendColor = latestEntry.classification === 'optimal'
    ? '#22c55e'
    : latestEntry.classification === 'normal'
    ? '#f59e0b'
    : '#ef4444';

  // Calculate trend direction
  const firstValue = sortedEntries[0].value;
  const lastValue = sortedEntries[sortedEntries.length - 1].value;
  const isImproving = latestEntry.classification === 'optimal' ||
    (latestEntry.classification === 'normal' && lastValue > firstValue);

  return (
    <div className="relative">
      <svg width={width} height={height} className="border border-border bg-white">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Trend line */}
        <path
          d={pathData}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={point.entry.classification === 'optimal' ? '#22c55e' :
                  point.entry.classification === 'normal' ? '#f59e0b' : '#ef4444'}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Trend indicator */}
      <div className="absolute -top-1 -right-1">
        <div className={`w-3 h-3 rounded-full ${
          isImproving ? 'bg-green-500' : 'bg-red-500'
        } flex items-center justify-center`}>
          <span className="text-white text-xs">
            {isImproving ? '↗' : '↘'}
          </span>
        </div>
      </div>

      {/* Mini stats */}
      <div className="absolute bottom-0 left-0 text-xs bg-white/90 px-1 py-0.5 rounded text-muted">
        {sortedEntries.length} pts
      </div>
    </div>
  );
}