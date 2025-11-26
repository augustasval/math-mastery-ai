import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

// Translation hook wrapper component
const ErrorDisplay = ({ error, onReload, onReset }: { error?: Error; onReload: () => void; onReset: () => void }) => {
  // Import translations dynamically
  const getTranslations = () => {
    const lang = localStorage.getItem('language') as 'en' | 'lt' || 'en';
    const translations = {
      en: {
        somethingWentWrong: "Something went wrong",
        errorMessage: "We encountered an unexpected error. This might be due to network connectivity or browser compatibility issues.",
        errorDetails: "Error details",
        reloadPage: "Reload Page",
        resetAndReload: "Reset & Reload"
      },
      lt: {
        somethingWentWrong: "Kažkas nutiko",
        errorMessage: "Susidūrėme su netikėta klaida. Tai gali būti dėl tinklo ryšio arba naršyklės suderinamumo problemų.",
        errorDetails: "Klaidos detalės",
        reloadPage: "Perkrauti puslapį",
        resetAndReload: "Atstatyti ir perkrauti"
      }
    };
    return translations[lang];
  };

  const t = getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>{t.somethingWentWrong}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t.errorMessage}
          </p>
          {error && (
            <details className="text-xs bg-muted p-2 rounded">
              <summary className="cursor-pointer">{t.errorDetails}</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.toString()}</pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={onReload} 
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.reloadPage}
            </Button>
            <Button 
              onClick={onReset} 
              className="flex-1"
            >
              {t.resetAndReload}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          error={this.state.error}
          onReload={() => window.location.reload()}
          onReset={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}
