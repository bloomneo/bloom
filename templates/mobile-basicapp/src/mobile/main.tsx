import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import App from './App';
import './styles/index.css';
import '@voilajsx/uikit/styles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);