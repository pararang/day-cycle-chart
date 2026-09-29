import React, { useMemo } from 'react';
import { LayerCard } from '@cloudflare/kumo';
import { ChartActivity } from '@/lib/chart-activity';
import { activityArc, CENTER } from '@/lib/chart-geometry';

interface ActivityChartProps {
  activities: ChartActivity[];
  fullWidth: boolean;
  chartRef: React.RefObject<HTMLDivElement>;
}

// "450 minutes" -> "7h 30m" (never rounds a 30-minute activity up to "1h").
const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// Minutes-since-midnight -> "HH:MM", wrapping past midnight (e.g. 1500 -> 01:00).
const formatTime = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const createPieSlice = (activity: ChartActivity, index: number) => {
  const { pathData, label } = activityArc(activity);
  const isLong = activity.name.length > 30;
  const displayName = isLong ? activity.name.substring(0, 30) + '...' : activity.name;

  const timeRange = `${formatTime(activity.startMinutes)}–${formatTime(activity.endMinutes)}`;

  return (
    <g key={`${activity.name}-${index}`}>
      <path
        d={pathData}
        fill={activity.color}
        stroke="white"
        strokeWidth="0.5"
        className="hover:opacity-80 transition-opacity"
      >
        <title>{activity.name} · {timeRange} · {formatDuration(activity.duration)}</title>
      </path>
      <text
        x={label.x}
        y={label.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isLong ? 4.8 : 6.4}
        fill="#000000"
        stroke="#ffffff"
        strokeWidth={0.6}
        paintOrder="stroke"
        transform={`rotate(${label.rotation}, ${label.x}, ${label.y})`}
      >
        {displayName}
      </text>
    </g>
  );
};

// Clock face numerals/ticks never depend on props — computed once at module
// load instead of being rebuilt on every render.
const CLOCK_NUMBERS = (() => {
  const numbers = [];
  const centerX = CENTER;
  const centerY = CENTER;
  const radius = 220;
  const lineLength = 210;

  for (let i = 1; i <= 12; i++) {
    const angle = ((i * 30) - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const lineX = centerX + lineLength * Math.cos(angle);
    const lineY = centerY + lineLength * Math.sin(angle);

    numbers.push(
      <g key={i}>
        <line
          x1={centerX}
          y1={centerY}
          x2={lineX}
          y2={lineY}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.2}
          fontWeight={700}
          fill="#334155"
        >
          {i}
        </text>
        {i === 12 && (
          <>
            <text x={CENTER - 52} y={CENTER - 216} textAnchor="middle" fontSize={9} fontWeight={700} fill="#334155">AM</text>
            <text x={CENTER + 52} y={CENTER - 216} textAnchor="middle" fontSize={9} fontWeight={700} fill="#334155">PM</text>
          </>
        )}
      </g>
    );
  }
  return numbers;
})();

const ActivityChart: React.FC<ActivityChartProps> = ({ activities, fullWidth, chartRef }) => {
  // Recomputed only when the activity list itself changes, not on every
  // render (e.g. the Full Width toggle no longer re-derives arc geometry).
  const { innerSlices, outerSlices } = useMemo(() => {
    const inner = activities
      .filter(a => a.zone === 'inner')
      .map((activity, index) => createPieSlice(activity, index));
    const outer = activities
      .filter(a => a.zone === 'outer')
      .map((activity, index) => createPieSlice(activity, index));
    return { innerSlices: inner, outerSlices: outer };
  }, [activities]);

  return (
    <LayerCard className="p-6">
        <div ref={chartRef} className="flex flex-col items-center bg-background">
          <svg
            role="img"
            aria-label={`24-hour activity clock chart showing ${activities.length} activities`}
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            className={`block h-auto mb-6 ${fullWidth ? 'max-w-[90vw]' : 'max-w-[60vw]'}`}
          >
            {CLOCK_NUMBERS}
            {innerSlices}
            {outerSlices}
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
            {activities.map((activity, index) => (
              <div key={`${activity.name}-${index}`} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: activity.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{activity.name}&nbsp;
                    <span className="text-xs text-muted-foreground">
                    {formatDuration(activity.duration)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </LayerCard>
  );
};

export default ActivityChart;
