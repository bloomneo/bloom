import React from 'react';
import { Footer as UIFooter } from '@bloomneo/uikit/footer';

// Configurable Footer Component using UIKit sections
export const Footer: React.FC = () => {
  return (
    <UIFooter tone="subtle" size="xl">
      <div className="flex flex-col space-y-4">
        {/* Branding Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
              MY
            </div>
            <span className="font-semibold text-foreground">MyApp</span>
          </div>

          {/* Copyright Only */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MyApp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </UIFooter>
  );
};