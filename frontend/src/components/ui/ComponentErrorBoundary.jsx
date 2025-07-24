import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Component Error Boundary caught an error:', error, errorInfo);
    
    // Send to error tracking service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { componentName = 'Component', fallback, showRetry = true } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {componentName} Error
          </h2>
          <p className="text-red-600 text-center mb-4 max-w-md">
            Something went wrong with this component. This is likely a temporary issue.
          </p>
          
          {showRetry && this.state.retryCount < 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </motion.button>
          )}

          {this.state.retryCount >= 3 && (
            <div className="text-sm text-red-500 text-center">
              <p>Multiple retry attempts failed.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 underline hover:text-red-800"
              >
                Refresh the page
              </button>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 w-full">
              <summary className="cursor-pointer text-sm text-red-500 hover:text-red-700">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                <div className="font-bold">Error:</div>
                <div>{this.state.error && this.state.error.toString()}</div>
                <div className="font-bold mt-2">Component Stack:</div>
                <div>{this.state.errorInfo.componentStack}</div>
              </div>
            </details>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const ComponentWithErrorBoundary = (props) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ComponentErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithErrorBoundary;
};

// Specific error boundaries for different scenarios
export const DashboardErrorBoundary = ({ children }) => (
  <ComponentErrorBoundary 
    componentName="Dashboard"
    fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Dashboard Unavailable</h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-center">
            We're experiencing technical difficulties. Please 
            try refreshing the page.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4 inline mr-2" />
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    }
  >
    {children}
  </ComponentErrorBoundary>
);

export const ModalErrorBoundary = ({ children }) => (
  <ComponentErrorBoundary 
    componentName="Modal"
    showRetry={true}
  >
    {children}
  </ComponentErrorBoundary>
);

export const ChartErrorBoundary = ({ children }) => (
  <ComponentErrorBoundary 
    componentName="Chart"
    fallback={
      <div className="flex items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Chart unavailable</p>
        </div>
      </div>
    }
  >
    {children}
  </ComponentErrorBoundary>
);

export default ComponentErrorBoundary;
