import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{this.state.error?.message || 'Something went wrong.'}</p>
            <button
              className="px-4 py-2 bg-accent text-background rounded"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
