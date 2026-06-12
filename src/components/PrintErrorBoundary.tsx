import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class PrintErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TICKET PRINT CRITICAL ERROR]:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="print-only"
          style={{
            padding: '16px',
            color: '#ef4444',
            background: '#fff',
            fontFamily: '"Courier New", Courier, monospace',
            border: '2px dashed #ef4444',
            margin: '10px',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          [Error generando vista de impresión]
        </div>
      )
    }

    return this.props.children
  }
}
