import React from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
  activitiesCount: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileName, activitiesCount }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="flex-1 grid md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onFileUpload}
                className="w-full p-2 text-sm border border-input rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
              />
              {fileName && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>{fileName}</span> |&nbsp;
                  <span className="font-medium">{activitiesCount}</span> activities loaded
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <a
                  href="https://raw.githubusercontent.com/pararang/day-cycle-chart/refs/heads/main/public/sample_activities.csv"
                  download
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 underline"
                  target='_blank'
                >
                  take a look
                </a>
                <span className="text-xs text-muted-foreground"> or </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 underline"
                  onClick={async () => {
                    const response = await fetch("https://raw.githubusercontent.com/pararang/day-cycle-chart/refs/heads/main/public/sample_activities.csv");
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "sample_activities.csv";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  }}
                  aria-label="Download sample CSV"
                >
                  download
                </button>
                &nbsp;
                <span className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80">the sample CSV</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;