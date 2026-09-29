import React from "react";
import { DownloadSimple, Upload } from "@phosphor-icons/react";
import { Button, LayerCard, Loader } from "@cloudflare/kumo";

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
  activitiesCount: number;
  uploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  fileName,
  activitiesCount,
  uploading,
}) => {
  return (
    <LayerCard className="mb-4 p-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {uploading ? (
            <Loader size="lg" className="text-primary" />
          ) : (
            <Upload size={32} className="text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 grid md:grid-cols-2 gap-4 items-center">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileUpload}
            aria-label="Upload your activity CSV or Excel file (columns: activity, start, end)"
            className="w-full p-2 text-label border border-input rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-meta"
          />
          <div>
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadSimple size={16} />}
              onClick={async () => {
                const response = await fetch(
                  "https://raw.githubusercontent.com/pararang/day-cycle-chart/refs/heads/main/public/sample_activities.csv",
                );
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sample_activities.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              }}
            >
              Download sample CSV
            </Button>
          </div>
        </div>
      </div>
    </LayerCard>
  );
};

export default FileUpload;
