import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessedActivity } from '@/lib/schedule';
import { activityArc, CENTER } from '@/lib/chart-geometry';

interface ChartActivity extends ProcessedActivity {
  color: string;
}

interface ActivityChartProps {
  activities: ChartActivity[];
  fullWidth: boolean;
  chartRef: React.RefObject<HTMLDivElement>;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activities, fullWidth, chartRef }) => {
  const createPieSlice = (activity: ChartActivity, index: number) => {
    const { pathData, label } = activityArc(activity);
    const isLong = activity.name.length > 30;
    const displayName = isLong ? activity.name.substring(0, 30) + '...' : activity.name;

    return (
      <g key={`${activity.name}-${index}`}>
        <path
          d={pathData}
          fill={activity.color}
          stroke="white"
          strokeWidth="0.5"
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isLong ? '0.3rem' : '0.4rem'}
          className="fill-black"
          style={{ textShadow: '0.5px 0.5px 0.5px rgb(255, 255, 255)' }}
          transform={`rotate(${label.rotation}, ${label.x}, ${label.y})`}
        >
          {displayName}
        </text>
      </g>
    );
  };

  const createClockNumbers = () => {
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
            fontSize="0.7rem"
            className="font-bold fill-slate-700"
          >
            {i}
          </text>
        </g>
      );
    }
    return numbers;
  };

  const innerActivities = activities.filter(a => a.zone === 'inner');
  const outerActivities = activities.filter(a => a.zone === 'outer');

  return (
    <Card>
      <CardContent className="p-6">
        <div ref={chartRef} className="flex flex-col items-center bg-background">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            style={{
              maxWidth: fullWidth ? '90vw' : '60vw',
              height: 'auto',
              display: 'block',
              marginBottom: '1.5rem'
            }}
          >
            {createClockNumbers()}
            {innerActivities.map((activity, index) => createPieSlice(activity, index))}
            {outerActivities.map((activity, index) => createPieSlice(activity, index))}
          </svg>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: activity.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{activity.name}&nbsp;
                    <span className="text-xs text-muted-foreground">
                    {Math.round(activity.duration / 60)}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;