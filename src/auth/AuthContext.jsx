import React, { createContext, useContext, useState } from 'react'
import { saveToken, getToken, clearToken } from './tokenStore'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken)   // reads localStorage on first render

  function login(raw) {
    saveToken(raw)
    setToken(raw)
  }

  function logout() {
    clearToken()
    setToken(null)
  }

  return (
    <Ctx.Provider value={{ token, isLoggedIn: !!token, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)