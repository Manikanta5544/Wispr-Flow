import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('UI render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600 text-sm">
          Something went wrong while rendering the application.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
