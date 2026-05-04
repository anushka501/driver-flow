const KEY = 'zm_access_token'

export const saveToken  = token => localStorage.setItem(KEY, token.trim())
export const getToken   = ()    => localStorage.getItem(KEY)
export const clearToken = ()    => localStorage.removeItem(KEY)