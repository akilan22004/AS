import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Annamalai Furniture] UI Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-[420px] bg-[#FCFAF7] border border-[#DDD1C0] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EFE9DF] text-[#493326] flex items-center justify-center text-xl font-serif">
              ✦
            </div>
            <h1 className="font-serif text-lg font-bold text-[#241B16]">Something went wrong</h1>
            <p className="text-xs text-[#695446] leading-relaxed">
              We encountered an unexpected display issue. Please reload to continue browsing our handcrafted collections.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] px-5 py-2 rounded-full font-serif text-xs transition-colors shadow-sm"
              >
                Return to Home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="border border-[#493326] text-[#493326] hover:bg-[#F2ECE1] px-5 py-2 rounded-full font-serif text-xs transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
