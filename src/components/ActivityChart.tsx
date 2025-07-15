import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProcessedActivity {
  name: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  color: string;
  zone: 'inner' | 'outer';
  startAngle: number;
  endAngle: number;
}

interface ActivityChartProps {
  activities: ProcessedActivity[];
  fullWidth: boolean;
  chartRef: React.RefObject<HTMLDivElement>;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activities, fullWidth, chartRef }) => {
  const createPieSlice = (activity: ProcessedActivity, index: number) => {
    const centerX = 250;
    const centerY = 250;
    const outerRadius = activity.zone === 'inner' ? 120 : 200;
    const innerRadius = activity.zone === 'inner' ? 0 : 130;

    const startAngleRad = (activity.startAngle * Math.PI) / 180;
    let endAngleRad = (activity.endAngle * Math.PI) / 180;

    // Handle angle wrapping for overnight activities
    let angleWidth = activity.endAngle - activity.startAngle;
    if (angleWidth <= 0) {
      angleWidth += 360;
      endAngleRad = ((activity.endAngle + 360) * Math.PI) / 180;
    }

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = angleWidth > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    // Calculate text position (middle of the arc)
    const midAngle = activity.startAngle + angleWidth / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    let textRadius;
    if (activity.zone === 'outer') {
      textRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
    } else {
      textRadius = (outerRadius + innerRadius) / 2;
    }
    const textX = centerX + textRadius * Math.cos(midAngleRad);
    const textY = centerY + textRadius * Math.sin(midAngleRad);

    const isLeftHalf = midAngle > 90 && midAngle < 270;
    const rotation = isLeftHalf ? midAngle + 180 : midAngle;

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
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={activity.name.length > 30 ? '0.3rem' : '0.4rem'}
          className="fill-black"
          style={{ textShadow: '0.5px 0.5px 0.5px rgb(255, 255, 255)' }}
          transform={`rotate(${rotation}, ${textX}, ${textY})`}
        >
          {activity.name.length > 30 ? activity.name.substring(0, 30) + '...' : activity.name}
        </text>
      </g>
    );
  };

  const createClockNumbers = () => {
    const numbers = [];
    const centerX = 250;
    const centerY = 250;
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
                  <div className="text-sm font-medium truncate">{activity.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(activity.duration / 60)}h
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