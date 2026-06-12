import { Component } from 'react';
import { logError } from '../utils/errorLogging';
import { FallbackUI } from './FallbackUI';

type EBProps = { children: import('react').ReactNode };
type EBState = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: import('react').ErrorInfo) {
    logError(error, 'render', {
      // React's componentStack is typed as `string | null | undefined`
      // depending on the build/React version. Normalize to `undefined`
      // so the StructuredError contract (string | undefined) isn't
      // violated by an unexpected `null` slipping through.
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  handleRetry = () => {
    // window.location.reload() re-mounts the entire tree, so the local
    // setState is redundant — drop it to avoid confusing readers.
    window.location.reload();
  };

  render(): import('react').ReactNode {
    if (this.state.hasError) {
      // biome-ignore lint/style/noNonNullAssertion: error is set when hasError is true
      return <FallbackUI error={this.state.error!} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
