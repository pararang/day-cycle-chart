import React, { useState, useRef, useCallback } from 'react';
import { Clock } from '@phosphor-icons/react';
import { useKumoToastManager } from '@cloudflare/kumo';
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
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { add: toast } = useKumoToastManager();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      const raw = await parseActivityFile(file);
      const processed = processActivities(raw);
      const chartActivities = toChartActivities(processed);
      setActivities(chartActivities);

      const skipped = raw.length - processed.length;
      toast({
        variant: "success",
        title: "File uploaded successfully!",
        description: skipped > 0
          ? `Processed ${processed.length} activities (skipped ${skipped} invalid)`
          : `Processed ${processed.length} activities`,
      });
    } catch (error) {
      console.error('File parsing error:', error);
      toast({
        variant: "error",
        title: "Error parsing file",
        description: "Please check your file format",
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const downloadChart = useCallback(async () => {
    const node = chartRef.current;
    if (!node) return;

    setDownloading(true);
    try {
      // Loaded on demand: html-to-image is only needed when a user exports,
      // so keep it out of the initial bundle. It renders via the browser's
      // own engine (foreignObject SVG), so it handles Tailwind v4's oklch()
      // colors that html2canvas cannot parse.
      const { toPng } = await import('html-to-image');

      // Pad the captured node below the last row and expose truncated legend
      // labels during capture, restoring both afterward.
      const prevPad = node.style.paddingBottom;
      node.style.paddingBottom = '24px';
      const truncates = Array.from(node.querySelectorAll('.truncate')) as HTMLElement[];
      truncates.forEach((el) => { el.style.overflow = 'visible'; });

      let dataUrl: string;
      try {
        dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true });
      } finally {
        node.style.paddingBottom = prevPad;
        truncates.forEach((el) => { el.style.overflow = ''; });
      }

      const link = document.createElement('a');
      link.download = 'activity-chart.png';
      link.href = dataUrl;
      link.click();

      toast({
        variant: "success",
        title: "Chart downloaded!",
        description: "Your activity chart has been saved",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Download failed",
        description: "There was an error downloading the chart",
      });
    } finally {
      setDownloading(false);
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
            <Clock size={32} className="text-primary" aria-hidden="true" />
            Daily Activity Visualization in 24-Hour Clock Chart
          </h1>
          <p className="text-muted-foreground">
            Visualize your 24-hour schedule with an interactive clock chart
          </p>
        </div>

        <FileUpload onFileUpload={handleFileUpload} fileName={fileName} activitiesCount={activities.length} uploading={uploading} />

        {activities.length > 0 && (
          <ChartControls
            fullWidth={fullWidth}
            onFullWidthToggle={setFullWidth}
            onDownload={downloadChart}
            downloading={downloading}
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