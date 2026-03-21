import { Component } from 'react';
import { FallbackUI } from './FallbackUI';

type EBProps = { children: import('react').ReactNode };
type EBState = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: import('react').ErrorInfo) {
    console.error('[ErrorBoundary] Render error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): import('react').ReactNode {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error!} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
