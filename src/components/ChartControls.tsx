import React from 'react';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ChartControlsProps {
  fullWidth: boolean;
  onFullWidthToggle: (fullWidth: boolean) => void;
  onDownload: () => void;
  activitiesCount: number;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  fullWidth,
  onFullWidthToggle,
  onDownload,
  activitiesCount
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{activitiesCount}</span> activities loaded
            </div>
            <div className="hidden sm:block h-4 w-px bg-border"></div>
            <div className="text-sm text-muted-foreground">
              <span className="text-blue-600 font-medium">Inner ring:</span> 6AM-6PM
              <span className="mx-2">•</span>
              <span className="text-purple-600 font-medium">Outer ring:</span> 6PM-6AM
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFullWidthToggle(!fullWidth)}
              className="flex items-center space-x-2"
            >
              {fullWidth ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{fullWidth ? 'Compact' : 'Full Width'}</span>
            </Button>
            
            <Button
              onClick={onDownload}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartControls;