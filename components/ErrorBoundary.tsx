import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Em desenvolvimento, mostra mais detalhes
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary - Detalhes do Erro');
      console.error('Erro:', error);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  public render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center p-6">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h3>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-red-600 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;