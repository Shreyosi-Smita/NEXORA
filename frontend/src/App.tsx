import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
};

export default App;
