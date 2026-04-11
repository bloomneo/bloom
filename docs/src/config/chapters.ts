export interface Chapter {
  id: string;
  title: string;
  pages: Page[];
}

export interface Page {
  id: string;
  title: string;
  path: string;
  description?: string;
}

export const webChapters: Chapter[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    pages: [
      {
        id: 'what-is-helix',
        title: 'What is Helix?',
        path: '/web/introduction/what-is-helix',
        description: 'Overview of the Helix framework and its purpose',
      },
      {
        id: 'why-helix',
        title: 'Why Helix?',
        path: '/web/introduction/why-helix',
        description: 'Benefits and use cases for choosing Helix',
      },
    ],
  },
  {
    id: 'architecture',
    title: '2. Architecture',
    pages: [
      {
        id: 'fbca-overview',
        title: 'FBCA Overview',
        path: '/web/architecture/fbca-overview',
        description: 'Understanding Feature-Based Component Architecture',
      },
      {
        id: 'project-structure',
        title: 'Project Structure',
        path: '/web/architecture/project-structure',
        description: 'How a Helix project is organized',
      },
      {
        id: 'how-it-works',
        title: 'How It Works',
        path: '/web/architecture/how-it-works',
        description: 'The flow from request to response',
      },
    ],
  },
  {
    id: 'backend',
    title: '3. Backend (AppKit)',
    pages: [
      {
        id: 'server-setup',
        title: 'Server Setup',
        path: '/web/backend/server-setup',
        description: 'Setting up the Express server with AppKit',
      },
      {
        id: 'routes-services',
        title: 'Routes & Services',
        path: '/web/backend/routes-services',
        description: 'Creating API routes and business logic',
      },
      {
        id: 'api-patterns',
        title: 'API Patterns',
        path: '/web/backend/api-patterns',
        description: 'Best practices for API design',
      },
    ],
  },
  {
    id: 'frontend',
    title: '4. Frontend (UIKit)',
    pages: [
      {
        id: 'components',
        title: 'Components',
        path: '/web/frontend/components',
        description: 'Using UIKit components in your app',
      },
      {
        id: 'routing',
        title: 'Routing',
        path: '/web/frontend/routing',
        description: 'File-based routing and navigation',
      },
      {
        id: 'themes',
        title: 'Themes',
        path: '/web/frontend/themes',
        description: 'Customizing the look with themes',
      },
    ],
  },
  {
    id: 'tutorials',
    title: '5. Tutorials',
    pages: [
      {
        id: 'basic-app',
        title: 'Basic App',
        path: '/web/tutorials/basic-app',
        description: 'Build your first Helix application',
      },
      {
        id: 'essential-app',
        title: 'Essential App',
        path: '/web/tutorials/essential-app',
        description: 'Add authentication and database',
      },
      {
        id: 'advanced-app',
        title: 'Advanced App',
        path: '/web/tutorials/advanced-app',
        description: 'Production-ready features and deployment',
      },
    ],
  },
];

// Helper to get all pages as flat array
export const getAllPages = (chapters: Chapter[]): Page[] => {
  return chapters.flatMap(chapter => chapter.pages);
};

// Helper to find next/previous page
export const getAdjacentPages = (chapters: Chapter[], currentPath: string) => {
  const allPages = getAllPages(chapters);
  const currentIndex = allPages.findIndex(p => p.path === currentPath);

  return {
    prev: currentIndex > 0 ? allPages[currentIndex - 1] : null,
    next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null,
  };
};
