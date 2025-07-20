import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import FileUpload from './FileUpload';
import ChartControls from './ChartControls';
import ActivityChart from './ActivityChart';
import EmptyState from './EmptyState';
import Footer from './Footer';

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

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#F5B041', '#D7BDE2',
  '#FFD6E0', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB',
  '#B5B9FF', '#FFB7B2', '#F3FFE3', '#F9F871', '#A0CED9'
];

const ActivityTracker = () => {
  const [activities, setActivities] = useState<ProcessedActivity[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fullWidth, setFullWidth] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-primary" />
            Daily Activity Visualization in 24-Hour Clock Chart
          </h1>
          <p className="text-muted-foreground">
            Visualize your 24-hour schedule with an interactive clock chart
          </p>
        </div>

        <FileUpload onFileUpload={handleFileUpload} fileName={fileName} activitiesCount={activities.length} />

        {activities.length > 0 && (
          <ChartControls
            fullWidth={fullWidth}
            onFullWidthToggle={setFullWidth}
            onDownload={downloadChart}
          />
        )}

        {activities.length > 0 ? (
          <ActivityChart
            activities={activities}
            fullWidth={fullWidth}
            chartRef={chartRef}
          />
        ) : (
          <EmptyState />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default ActivityTracker;