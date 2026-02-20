'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error Boundary — catches render errors and shows Hebrew recovery UI.
 * Usage: wrap any module page with <ErrorBoundary>.
 */

import { C } from '@/shared/lib/design-tokens';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  /** Optional module name for error context */
  module?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RiskGuard Error]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: '48px 32px',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: C.dangerBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={28} color={C.danger} />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              fontFamily: 'var(--font-rubik)',
              margin: '0 0 6px',
            }}
          >
            שגיאה בטעינת {this.props.module || 'העמוד'}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
              margin: '0 0 8px',
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            אירעה שגיאה לא צפויה. נסה לרענן את הדף.
          </p>
          {this.state.error && (
            <p
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontFamily: 'monospace',
                margin: '0 0 20px',
                direction: 'ltr',
                background: C.dangerBg,
                padding: '8px 12px',
                borderRadius: 6,
                maxWidth: 500,
                marginLeft: 'auto',
                marginRight: 'auto',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              background: C.accentGrad,
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-rubik)',
            }}
          >
            נסה שוב
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
