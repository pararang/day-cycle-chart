import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import FileUpload from './FileUpload';
import ChartControls from './ChartControls';
import ActivityChart from './ActivityChart';
import EmptyState from './EmptyState';
import Footer from './Footer';
import { processActivities } from '@/lib/schedule';
import { parseActivityFile } from '@/lib/parse';
import { ChartActivity, toChartActivities } from '@/lib/chart-activity';

const ActivityTracker = () => {
  const [activities, setActivities] = useState<ChartActivity[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fullWidth, setFullWidth] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const raw = await parseActivityFile(file);
      const processed = processActivities(raw);
      const chartActivities = toChartActivities(processed);
      setActivities(chartActivities);

      const skipped = raw.length - processed.length;
      toast({
        title: "File uploaded successfully!",
        description: skipped > 0
          ? `Processed ${processed.length} activities (skipped ${skipped} invalid)`
          : `Processed ${processed.length} activities`,
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
    <div className="min-h-screen w-full relative bg-white">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
        radial-gradient(125% 125% at 50% 90%, #ffffffff 40%, #14b8a6 100%)
      `,
          backgroundSize: "100% 100%",
        }}
      />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="py-8 px-4 sm:px-6 lg:px-8"></div>
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

      {/* Floating Saweria QR Code - Bottom Right */}
      {activities.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 animate-pulse">
          <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <p className="text-xs text-center text-gray-600 font-bold">Buy me a coffee</p>
            <div className="mt-2">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=https://saweria.co/pararang"
                alt="Donate via Saweria"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
                title="Scan to donate via Saweria"
              />
            </div>
            <p className="text-xs text-center text-gray-600 mt-1">https://saweria.co/pararang</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTracker;