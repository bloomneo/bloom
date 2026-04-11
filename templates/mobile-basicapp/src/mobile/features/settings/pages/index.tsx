import React from 'react';
import { Card, CardContent } from '@bloomneo/uikit';

export const SettingsPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 py-6 space-y-6 pb-20">

        <div className="text-center space-y-4 mt-12">
          <h1 className="text-3xl font-bold text-primary">Settings</h1>

          <Card className="bg-muted/30">
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-center text-muted-foreground">
                Add your settings here
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
