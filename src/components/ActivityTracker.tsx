
import React, { useState, useRef } from 'react';
import { Upload, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

interface Activity {
  activity: string;
  start: string;
  end: string;
}

interface ProcessedActivity {
  name: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  color: string;
  isDaytime: boolean;
}

const ActivityTracker = () => {
  const [activities, setActivities] = useState<ProcessedActivity[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split('.').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const processActivities = (rawActivities: Activity[]): ProcessedActivity[] => {
    return rawActivities.map((activity, index) => {
      const startMinutes = timeToMinutes(activity.start);
      const endMinutes = timeToMinutes(activity.end);
      
      // Handle overnight activities
      const duration = endMinutes > startMinutes 
        ? endMinutes - startMinutes 
        : (24 * 60) - startMinutes + endMinutes;

      // Determine if activity is primarily daytime based on clock position
      // 6am = 90°, 6pm = 270° (bottom half of clock is daytime)
      // Convert to 12-hour clock: 6am-6pm should be inner ring
      const startHour = Math.floor(startMinutes / 60);
      const isDaytime = startHour >= 6 && startHour < 18; // 6am to 6pm

      return {
        name: activity.activity,
        startMinutes,
        endMinutes,
        duration,
        color: colors[index % colors.length],
        isDaytime
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsedData: Activity[] = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const text = data as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
          
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              start: values[0],
              end: values[1],
              activity: values[2] // Activity name is now in the last column
            };
          });
        } else {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          parsedData = jsonData.map(row => ({
            start: row.start || row.Start,
            end: row.end || row.End,
            activity: row.activity || row.Activity
          }));
        }

        const processed = processActivities(parsedData);
        setActivities(processed);
        
        toast({
          title: "File uploaded successfully!",
          description: `Processed ${processed.length} activities`,
        });
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "Please check your file format",
          variant: "destructive",
        });
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'activity-chart.png';
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Chart downloaded!",
        description: "Your activity chart has been saved",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the chart",
        variant: "destructive",
      });
    }
  };

  const createPieSlice = (activity: ProcessedActivity, index: number, isInnerRing: boolean) => {
    const totalMinutes = 24 * 60;
    // Map 24-hour time to clock positions: 6am starts at top (0°), 6pm at bottom (180°)
    // Subtract 360 minutes (6 hours) to make 6am the starting point (top of clock)
    const adjustedStartMinutes = (activity.startMinutes - 360 + totalMinutes) % totalMinutes;
    const startAngle = (adjustedStartMinutes / totalMinutes) * 360;
    const endAngle = startAngle + (activity.duration / totalMinutes) * 360;
    
    const centerX = 200;
    const centerY = 200;
    const outerRadius = isInnerRing ? 120 : 160;
    const innerRadius = isInnerRing ? 60 : 120;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return (
      <path
        key={`${activity.name}-${index}`}
        d={pathData}
        fill={activity.color}
        stroke="#fff"
        strokeWidth="2"
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
    );
  };

  const createClockTickers = () => {
    const tickers = [];
    const clockPositions = [
      { hour: 6, label: '6AM' },  // Top (6am)
      { hour: 12, label: '12PM' }, // Right (12pm/noon)
      { hour: 18, label: '6PM' },  // Bottom (6pm)
      { hour: 0, label: '12AM' }   // Left (12am/midnight)
    ];

    clockPositions.forEach(({ hour, label }) => {
      // Map to clock position: 6am at top (0°), rotating clockwise
      const angle = ((hour - 6) / 24) * 360;
      const angleRad = (angle * Math.PI) / 180;
      const centerX = 200;
      const centerY = 200;
      
      const outerRadius = 180;
      const innerRadius = 165;
      
      const x1 = centerX + innerRadius * Math.cos(angleRad);
      const y1 = centerY + innerRadius * Math.sin(angleRad);
      const x2 = centerX + outerRadius * Math.cos(angleRad);
      const y2 = centerY + outerRadius * Math.sin(angleRad);

      tickers.push(
        <line
          key={hour}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#64748b"
          strokeWidth="3"
        />
      );

      const textRadius = 195;
      const textX = centerX + textRadius * Math.cos(angleRad);
      const textY = centerY + textRadius * Math.sin(angleRad);
      
      tickers.push(
        <text
          key={`text-${hour}`}
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-sm font-semibold fill-slate-600"
        >
          {label}
        </text>
      );
    });

    return tickers;
  };

  const daytimeActivities = activities.filter(a => a.isDaytime);
  const nighttimeActivities = activities.filter(a => !a.isDaytime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <Clock className="text-blue-600" size={40} />
            Daily Activity Tracker
          </h1>
          <p className="text-slate-600 text-lg">Visualize your 24-hour schedule with interactive pie charts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Upload Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload CSV or Excel file
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {fileName && (
                  <p className="text-sm text-green-600 mt-2">
                    Loaded: {fileName}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-2">Expected format:</p>
                <div className="bg-slate-50 p-3 rounded text-xs font-mono">
                  start, end, activity<br/>
                  06.00, 07.00, Gym<br/>
                  07.30, 17.00, Work<br/>
                  22.00, 06.00, Sleep
                </div>
              </div>

              {activities.length > 0 && (
                <Button onClick={downloadChart} className="w-full" variant="outline">
                  <Download size={16} className="mr-2" />
                  Download Chart
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Chart Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>24-Hour Activity Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div ref={chartRef} className="flex flex-col items-center bg-white p-6 rounded-lg">
                  <svg width="400" height="400" className="mb-6">
                    {/* Clock tickers */}
                    {createClockTickers()}
                    
                    {/* Inner ring (6am-6pm) */}
                    {daytimeActivities.map((activity, index) => 
                      createPieSlice(activity, index, true)
                    )}
                    
                    {/* Outer ring (6pm-6am) */}
                    {nighttimeActivities.map((activity, index) => 
                      createPieSlice(activity, index, false)
                    )}
                    
                    {/* Center labels */}
                    <text x="200" y="190" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                      Day Activities
                    </text>
                    <text x="200" y="205" textAnchor="middle" className="text-xs fill-slate-500">
                      6AM - 6PM
                    </text>
                    <text x="200" y="220" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                      Night Activities
                    </text>
                    <text x="200" y="235" textAnchor="middle" className="text-xs fill-slate-500">
                      6PM - 6AM
                    </text>
                  </svg>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: activity.color }}
                        />
                        <span className="text-sm text-slate-700">
                          {activity.name} ({Math.round(activity.duration / 60)}h)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Upload a file to visualize your daily activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
