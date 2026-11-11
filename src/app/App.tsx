import React from 'react';
import AppProviders from './AppProviders';
import AppRoutes from './routes/AppRoutes';
import '@/styles/App.css';

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
