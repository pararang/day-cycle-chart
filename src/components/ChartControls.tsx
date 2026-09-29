import React from 'react';
import { ArrowsIn, ArrowsOut, Download, Moon, Sun } from '@phosphor-icons/react';
import { Button, LayerCard } from '@cloudflare/kumo';

interface ChartControlsProps {
  fullWidth: boolean;
  onFullWidthToggle: (fullWidth: boolean) => void;
  onDownload: () => void;
  downloading: boolean;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  fullWidth,
  onFullWidthToggle,
  onDownload,
  downloading
}) => {
  return (
    <LayerCard className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="text-blue-600 font-medium">Inner ring:</span> 6AM-6PM <Sun size={14} className='inline' aria-hidden="true" />
              <span className="mx-2">•</span>
              <span className="text-purple-600 font-medium">Outer ring:</span> 6PM-6AM <Moon size={14} className='inline' aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={fullWidth ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
              onClick={() => onFullWidthToggle(!fullWidth)}
            >
              {fullWidth ? 'Compact' : 'Full Width'}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={16} />}
              onClick={onDownload}
              loading={downloading}
              aria-busy={downloading}
            >
              Download
            </Button>
          </div>
        </div>
    </LayerCard>
  );
};

export default ChartControls;