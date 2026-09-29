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
      title="Your day is waiting"
      description="Upload a CSV or Excel schedule to see it drawn as a 24-hour clock."
    />
  );
};

export default EmptyState;