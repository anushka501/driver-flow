import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import DriversPage from './pages/DriversPage';
import './styles/globals.css';
import './styles/components.css';
import './components/drivers/DriverProfile.css';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Navigate to="/drivers" replace />} />
          <Route path="/drivers" element={<DriversPage />} />
          {/* Future routes: /vehicles, /routes, /trips */}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
