import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // <-- App.jsx in components folder

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

