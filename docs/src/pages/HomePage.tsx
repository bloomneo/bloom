import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@voilajsx/uikit/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Monitor, Smartphone, Globe } from 'lucide-react';

const HomePage: React.FC = () => {
  const platforms = [
    {
      title: 'Web',
      description: 'Build modern fullstack web applications with React and Express',
      icon: Globe,
      path: '/web',
      color: 'bg-blue-500',
    },
    {
      title: 'Desktop',
      description: 'Create cross-platform desktop apps with Electron',
      icon: Monitor,
      path: '/desktop',
      color: 'bg-purple-500',
    },
    {
      title: 'Mobile',
      description: 'Deploy native iOS and Android apps with Capacitor',
      icon: Smartphone,
      path: '/mobile',
      color: 'bg-green-500',
    },
  ];

  const benefits = [
    {
      title: 'Zero Configuration',
      description: 'Convention over configuration approach gets you started instantly',
    },
    {
      title: 'Feature-Based Architecture',
      description: 'Organized code structure with auto-discovery routing',
    },
    {
      title: 'Fullstack Integration',
      description: 'Seamless frontend-backend communication out of the box',
    },
    {
      title: 'Multi-Platform',
      description: 'One codebase pattern for web, desktop, and mobile',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Helix Framework v1.2
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Build Fullstack Apps
            <br />
            <span className="text-foreground">With Confidence</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A modern fullstack framework combining <strong>UIKit</strong> (React) and <strong>AppKit</strong> (Express)
            with Feature-Based Component Architecture for web, desktop, and mobile.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              View on GitHub
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              React 18+
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Express.js
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              TypeScript
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              Vite
            </span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Why Helix?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Everything you need to build production-ready applications
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Cards Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Platform</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Helix supports multiple platforms with consistent architecture
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Link key={platform.path} to={platform.path} className="block group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                  <CardHeader className="text-center pb-2">
                    <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <platform.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{platform.title}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Quick Start</h2>
          <p className="text-muted-foreground text-center mb-8">
            Get up and running in seconds
          </p>

          <div className="bg-background border border-border rounded-lg p-6 font-mono text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground select-none">$</span>
                <span>npm install -g @voilajsx/helix</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground select-none">$</span>
                <span>helix create my-app</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground select-none">$</span>
                <span>cd my-app && npm run dev</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Helix Framework by <strong>VoilaJSX</strong> • MIT License
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
