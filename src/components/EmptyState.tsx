import React from 'react';
import { Clock, Upload } from '@phosphor-icons/react';
import { Empty } from '@cloudflare/kumo';

const EmptyState: React.FC = () => {
  return (
    <Empty
      icon={
        <div className="relative inline-flex">
          <Clock size={64} className="text-muted-foreground" aria-hidden="true" />
          <Upload
            size={28}
            className="text-primary absolute -bottom-1 -right-1 bg-background rounded-full"
            aria-hidden="true"
          />
        </div>
      }
      title="No Activities Yet"
      description="Upload your activity data to see a beautiful 24-hour visualization of your daily routine."
    />
  );
};

export default EmptyState;