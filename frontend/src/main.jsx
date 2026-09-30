import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Infinity ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#FAF8F4',
          color: '#071A2F',
          padding: '40px 24px',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: '#FFFFFF',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(7,26,47,0.08)',
            border: '1px solid rgba(7,26,47,0.08)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#071A2F' }}>
              Infinity Customizations
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
              A temporary display error occurred while rendering the page.
            </p>
            <pre style={{
              textAlign: 'left',
              fontSize: '12px',
              backgroundColor: '#FAF8F4',
              padding: '16px',
              borderRadius: '12px',
              overflow: 'auto',
              color: '#991B1B',
              marginBottom: '24px',
              maxHeight: '160px'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#071A2F',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
