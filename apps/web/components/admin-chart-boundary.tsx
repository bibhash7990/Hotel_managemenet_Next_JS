'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/query-state';

type Props = { children: ReactNode };

type State = { error: Error | null; resetKey: number };

export class AdminChartBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin chart error', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title="Chart unavailable"
          message="The admin chart failed to render. You can retry or refresh the page."
          onRetry={this.handleRetry}
          className="mt-10"
        />
      );
    }
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}
