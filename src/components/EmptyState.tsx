import React from 'react';
import { Clock, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Clock className="h-16 w-16 text-muted-foreground" />
              <Upload className="h-6 w-6 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">No Activities Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload your activity data to see a beautiful 24-hour visualization of your daily routine.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;