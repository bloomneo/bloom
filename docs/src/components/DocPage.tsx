import { Construction } from 'lucide-react';

interface DocPageProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  isPlaceholder?: boolean;
}

const DocPage: React.FC<DocPageProps> = ({
  title,
  description,
  children,
  isPlaceholder = false
}) => {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </header>

      {isPlaceholder ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Content Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This section is under development. Check back soon for comprehensive
            documentation and examples.
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default DocPage;
