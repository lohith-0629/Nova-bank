import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from './components/ui/Toast';
import { BankProvider } from './context/BankContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BankProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </BankProvider>
  );
};

export default App;
