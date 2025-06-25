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
  zone: 'inner' | 'outer';
  startAngle: number;
  endAngle: number;
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
    const [hours, minutes] = timeStr.split(/[:.]/);
    return parseInt(hours) * 60 + (parseInt(minutes) || 0);
  };

  // Convert time to angle on a 12-hour clock (following vanilla JS logic)
  const timeToAngle = (timeMinutes: number): number => {
    // Convert to hours and minutes
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    
    // Convert to 12-hour clock format (0-12 hours)
    const h = hours % 12;
    const angle = h * 30 + (minutes / 60) * 30;
    
    // Rotate so 12 is at the top (subtract 90 degrees)
    return (angle - 90 + 360) % 360;
  };

  // Determine if time is in inner or outer zone
  const getZone = (timeMinutes: number): 'inner' | 'outer' => {
    const hour = Math.floor(timeMinutes / 60);
    return (hour >= 6 && hour < 18) ? 'inner' : 'outer';
  };

  const processActivities = (rawActivities: Activity[]): ProcessedActivity[] => {
    return rawActivities.map((activity, index) => {
      const startMinutes = timeToMinutes(activity.start);
      let endMinutes = timeToMinutes(activity.end);
      
      // Handle overnight activities
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours
      }

      const duration = endMinutes - startMinutes;
      const zone = getZone(startMinutes);
      
      // Calculate angles using the corrected logic
      const startAngle = timeToAngle(startMinutes);
      const endAngle = timeToAngle(endMinutes % (24 * 60));

      return {
        name: activity.activity,
        startMinutes,
        endMinutes,
        duration,
        color: colors[index % colors.length],
        zone,
        startAngle,
        endAngle
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
          
          console.log('CSV Headers:', headers);
          
          // Find the indices for start, end, and activity/label columns
          const startIndex = headers.findIndex(h => h === 'start');
          const endIndex = headers.findIndex(h => h === 'end');
          const activityIndex = headers.findIndex(h => h === 'activity' || h === 'label');
          
          console.log('Column indices:', { startIndex, endIndex, activityIndex });
          
          if (startIndex === -1 || endIndex === -1 || activityIndex === -1) {
            throw new Error('Required columns not found. Expected: start, end, activity/label');
          }
          
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              start: values[startIndex],
              end: values[endIndex],
              activity: values[activityIndex]
            };
          }).filter(item => item.start && item.end && item.activity);
          
          console.log('Parsed CSV data:', parsedData);
        } else {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          parsedData = jsonData.map(row => ({
            start: row.start || row.Start,
            end: row.end || row.End,
            activity: row.activity || row.Activity || row.label || row.Label
          }));
        }

        const processed = processActivities(parsedData);
        setActivities(processed);
        
        toast({
          title: "File uploaded successfully!",
          description: `Processed ${processed.length} activities`,
        });
      } catch (error) {
        console.error('File parsing error:', error);
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

  const createPieSlice = (activity: ProcessedActivity, index: number) => {
    const centerX = 250;
    const centerY = 250;
    const outerRadius = activity.zone === 'inner' ? 150 : 200;
    const innerRadius = activity.zone === 'inner' ? 80 : 150;

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
    const textRadius = (outerRadius + innerRadius) / 2;
    const textX = centerX + textRadius * Math.cos(midAngleRad);
    const textY = centerY + textRadius * Math.sin(midAngleRad);

    // Only show text if the slice is large enough
    const showText = true; //activity.duration > 60; // Show text for activities longer than 1 hour

    return (
      <g key={`${activity.name}-${index}`}>
        <path
          d={pathData}
          fill={activity.color}
          stroke="#fff"
          strokeWidth="2"
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
        {showText && (
          <text
        x={textX}
        y={textY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={activity.name.length > 12 ? '0.3rem' : '0.5rem'}
        className="fill-white"
        style={{ textShadow: '1px 1px 1px rgb(0, 0, 0)' }}
          >
        {activity.name.length > 12 ? activity.name.substring(0, 12) + '...' : activity.name}
          </text>
        )}
      </g>
    );
  };

  const createClockNumbers = () => {
    const numbers = [];
    const centerX = 250;
    const centerY = 250;
    const radius = 220;

    for (let i = 1; i <= 12; i++) {
      const angle = ((i * 30) - 90) * Math.PI / 180; // 30 degrees per hour, -90 to start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      numbers.push(
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg font-bold fill-slate-700"
        >
          {i}
        </text>
      );
    }

    return numbers;
  };

  // Separate activities by zone
  const innerActivities = activities.filter(a => a.zone === 'inner');
  const outerActivities = activities.filter(a => a.zone === 'outer');

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

        <div className="grid grid-cols-1 lg:grid-cols-1">
          {/* Chart Section */}
          <Card className="lg:col-span-full">
            <CardHeader>
              <CardTitle>24-Hour Activity Visualization</CardTitle>
            </CardHeader>
            <CardContent>
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
                  start, end, label<br/>
                  06:00, 07:00, Gym<br/>
                  07:30, 17:00, Work<br/>
                  22:00, 06:00, Sleep
                </div>
              </div>

              {activities.length > 0 ? (
                <div ref={chartRef} className="flex flex-col items-center bg-white p-6 rounded-lg">
                    {/* Responsive SVG chart */}
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 500"
                      style={{
                        maxWidth: '80vw',
                        height: 'auto',
                        display: 'block',
                        marginBottom: '1.5rem'
                      }}
                    >
                      {/* Clock numbers */}
                      {createClockNumbers()}

                      {/* Inner ring (6am-6pm) - Daytime activities */}
                      {innerActivities.map((activity, index) => 
                        createPieSlice(activity, index)
                      )}

                      {/* Outer ring (6pm-6am) - Nighttime activities */}
                      {outerActivities.map((activity, index) => 
                        createPieSlice(activity, index)
                      )}

                      {/* Center labels */}
                      <text x="250" y="235" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                        Day Activities
                      </text>
                      <text x="250" y="250" textAnchor="middle" className="text-xs fill-slate-500">
                        6AM - 6PM
                      </text>
                      <text x="250" y="265" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                        Night Activities
                      </text>
                      <text x="250" y="280" textAnchor="middle" className="text-xs fill-slate-500">
                        6PM - 6AM
                      </text>
                    </svg>

                  {/* Legend */}
                  <div className="activity-legend grid grid-cols-2 gap-4 w-full max-w-md">
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

              {activities.length > 0 && (
                <Button onClick={downloadChart} className="w-full" variant="outline">
                  <Download size={16} className="mr-2" />
                  Download Chart
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
