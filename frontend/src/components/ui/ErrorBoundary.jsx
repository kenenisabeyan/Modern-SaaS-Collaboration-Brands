import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#1E2761] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white border border-[#E4E8EE] rounded-3xl p-6 sm:p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[#1E2761]">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              An unexpected error occurred while loading this view. You can reload or reset your local session.
            </p>
            {this.state.error && (
              <div className="bg-[#F5F7FA] border border-[#E4E8EE] rounded-xl p-3 mb-6 text-left overflow-x-auto text-xs font-mono text-rose-600">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF5A36]/20"
              >
                <RotateCcw size={16} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1E2761] hover:bg-[#151A44] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Home size={16} />
                <span>Clear & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

