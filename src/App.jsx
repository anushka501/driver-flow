import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import { AuthProvider, useAuth } from './auth/AuthContext'
import TokenPage from './pages/TokenPage'
import DriversPage from './pages/DriversPage'
import './styles/globals.css'
import './styles/components.css'
import './components/drivers/DriverProfile.css'

function AppRoutes() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return <TokenPage />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Navigate to="/drivers" replace />} />
        <Route path="/drivers" element={<DriversPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}