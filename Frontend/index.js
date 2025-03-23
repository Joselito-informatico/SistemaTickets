// Punto de entrada de la aplicación. Se configura React 18, el contexto de autenticación y React Query.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "@fortawesome/fontawesome-free/css/all.min.css";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Desregistramos los service workers si existieran (opcional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

reportWebVitals();