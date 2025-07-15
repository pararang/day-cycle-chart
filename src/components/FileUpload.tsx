import React from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileName }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Your Activity Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV or Excel file with your daily activities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Expected Format:</label>
              <div className="bg-muted p-4 rounded-lg text-xs font-mono">
                <div className="font-semibold mb-2">Headers: start, end, activity</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>06:00, 07:00, Gym</div>
                  <div>07:30, 17:00, Work</div>
                  <div>22:00, 06:00, Sleep</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Choose File:</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={onFileUpload}
                  className="w-full p-3 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                />
              </div>
              {fileName && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Loaded: {fileName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;