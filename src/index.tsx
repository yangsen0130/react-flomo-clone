// ./src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { TagsProvider } from './contexts/TagsContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <TagsProvider>
        <App />
      </TagsProvider>
    </AuthProvider>
  </React.StrictMode>
);