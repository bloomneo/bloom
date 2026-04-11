import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@voilajsx/uikit/button';
import { Construction, ArrowLeft, Monitor, Smartphone, Globe } from 'lucide-react';

const UnderConstruction: React.FC = () => {
  const location = useLocation();

  const platformInfo: Record<string, { title: string; icon: React.ElementType; color: string }> = {
    '/web': { title: 'Web Development', icon: Globe, color: 'text-blue-500' },
    '/desktop': { title: 'Desktop Development', icon: Monitor, color: 'text-purple-500' },
    '/mobile': { title: 'Mobile Development', icon: Smartphone, color: 'text-green-500' },
  };

  const current = platformInfo[location.pathname] || {
    title: 'This Page',
    icon: Construction,
    color: 'text-primary'
  };
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className={`w-12 h-12 ${current.color}`} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Construction className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500 uppercase tracking-wide">
              Under Construction
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{current.title}</h1>

          <p className="text-muted-foreground mb-8">
            We're working hard to bring you comprehensive tutorials and documentation
            for this platform. Check back soon!
          </p>

          <div className="space-y-3">
            <Link to="/">
              <Button size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Want to contribute? Check out our{' '}
            <a
              href="https://github.com/voilajsx/helix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub repository
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
