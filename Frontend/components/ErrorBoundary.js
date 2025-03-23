// Componente de clase que captura errores en sus descendientes y muestra un mensaje amigable.

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h1>Algo salió mal.</h1>
          <p>Intenta recargar la página o vuelve más tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;