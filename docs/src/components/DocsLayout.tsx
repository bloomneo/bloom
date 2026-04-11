import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '@voilajsx/uikit/page';
import { Button } from '@voilajsx/uikit/button';
import { Progress } from '@voilajsx/uikit/progress';
import { ChevronLeft, ChevronRight, Check, Circle, Home, BookOpen } from 'lucide-react';
import { Chapter, getAdjacentPages } from '../config/chapters';
import type { NavigationItem } from '@voilajsx/uikit';

interface DocsLayoutProps {
  children: React.ReactNode;
  chapters: Chapter[];
  platform: 'web' | 'desktop' | 'mobile';
}

const STORAGE_KEY = 'helix-docs-progress';

const DocsLayout: React.FC<DocsLayoutProps> = ({ children, chapters, platform }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [completedPages, setCompletedPages] = useState<string[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const progress = JSON.parse(saved);
      setCompletedPages(progress[platform] || []);
    }
  }, [platform]);

  // Save progress to localStorage
  const saveProgress = (pages: string[]) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const progress = saved ? JSON.parse(saved) : {};
    progress[platform] = pages;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };

  const toggleComplete = (pageId: string) => {
    const newCompleted = completedPages.includes(pageId)
      ? completedPages.filter(id => id !== pageId)
      : [...completedPages, pageId];
    setCompletedPages(newCompleted);
    saveProgress(newCompleted);
  };

  const { prev, next } = getAdjacentPages(chapters, location.pathname);

  // Calculate progress
  const totalPages = chapters.reduce((acc, ch) => acc + ch.pages.length, 0);
  const progressPercent = Math.round((completedPages.length / totalPages) * 100);

  // Get current page info
  const currentPage = chapters
    .flatMap(ch => ch.pages)
    .find(p => p.path === location.pathname);

  // Convert chapters to NavigationItem format for PageLayout
  const sidebarNavigation: NavigationItem[] = chapters.map((chapter) => ({
    key: chapter.id,
    label: chapter.title,
    icon: BookOpen,
    items: chapter.pages.map((page) => ({
      key: page.id,
      label: page.title,
      href: page.path,
      isActive: location.pathname === page.path,
      icon: completedPages.includes(page.id) ? Check : Circle,
    })),
  }));

  // Navigation handler
  const handleNavigate = (href: string) => {
    navigate(href);
  };

  // Header navigation
  const headerNavigation: NavigationItem[] = [
    { key: 'home', label: 'Home', href: '/', icon: Home },
  ];

  return (
    <PageLayout scheme="sidebar" tone="clean" size="full">
      <PageLayout.Header
        position="relative"
        logo={
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-bold">
              H
            </div>
            <span>Helix Docs</span>
            <span className="text-muted-foreground text-sm">
              / {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          </Link>
        }
        navigation={headerNavigation}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        actions={
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Progress value={progressPercent} className="w-24 h-2" />
              <span className="text-muted-foreground">{progressPercent}%</span>
            </div>
          </div>
        }
      />

      <PageLayout.Content
        sidebar="left"
        navigation={sidebarNavigation}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        sidebarPosition="sticky"
      >
        <div className="max-w-4xl">
          {/* Content */}
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </article>

          {/* Mark as Complete */}
          {currentPage && (
            <div className="mt-12 pt-6 border-t border-border">
              <Button
                variant={completedPages.includes(currentPage.id) ? 'outline' : 'default'}
                onClick={() => toggleComplete(currentPage.id)}
                className="w-full sm:w-auto"
              >
                {completedPages.includes(currentPage.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {prev ? (
              <Link to={prev.path} className="flex-1">
                <Button variant="outline" className="w-full justify-start">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <div className="text-left truncate">
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="truncate">{prev.title}</div>
                  </div>
                </Button>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {next ? (
              <Link to={next.path} className="flex-1">
                <Button variant="outline" className="w-full justify-end">
                  <div className="text-right truncate">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="truncate">{next.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </PageLayout.Content>

      <PageLayout.Footer
        copyright="Helix Framework by VoilaJSX • MIT License"
      />
    </PageLayout>
  );
};

export default DocsLayout;
