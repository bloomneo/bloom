import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageLayout } from '@bloomneo/uikit';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    navigate('/'); // Go to home page
  };

  return (
    <PageLayout>
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for does not exist"
      />
      <Header />

      <PageLayout.Content>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-center text-3xl">404 - Page Not Found</CardTitle>
              <CardDescription className="text-center text-lg">
                The page you are looking for does not exist or has been moved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default NotFoundPage;
