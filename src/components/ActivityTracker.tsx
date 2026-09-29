import React, { useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FileUpload from './FileUpload';
import ChartControls from './ChartControls';
import ActivityChart from './ActivityChart';
import EmptyState from './EmptyState';
import SeoContent from './SeoContent';
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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [toast]);

  const downloadChart = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      // Loaded on demand: html2canvas is large and only needed when a user
      // actually exports, so keep it out of the initial bundle.
      const { default: html2canvas } = await import('html2canvas');
      // Capture the chart's full height plus a small bottom pad: html2canvas
      // draws text slightly below the line box, which both clips the legend's
      // `truncate` (overflow: hidden) labels and nicks the last row at the
      // canvas edge. The clone gets matching padding so nothing is cropped.
      const captureHeight = chartRef.current.scrollHeight + 24;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        height: captureHeight,
        windowHeight: captureHeight,
        onclone: (_doc, element) => {
          element.style.paddingBottom = '24px';
          element.querySelectorAll('.truncate').forEach((node) => {
            (node as HTMLElement).style.overflow = 'visible';
          });
        },
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
  }, [toast]);

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
        <div className="py-8"></div>
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-primary" aria-hidden="true" />
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

        <SeoContent />

        <Footer />
      </div>
    </div>
  );
};

export default ActivityTracker;