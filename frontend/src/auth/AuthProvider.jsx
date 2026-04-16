import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { getToken, setToken } from './authStorage.js'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const saveToken = useCallback((t) => {
    setTokenState(t || '')
    setToken(t || '')
  }, [])

  const hydrate = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await authApi.me(t)
      setUser(me)
    } catch (e) {
      if (e?.status === 401) {
        try {
          const refreshed = await authApi.refresh()
          if (refreshed?.token) {
            saveToken(refreshed.token)
            const me = await authApi.me(refreshed.token)
            setUser(me)
          } else {
            saveToken('')
            setUser(null)
          }
        } catch {
          saveToken('')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const login = useCallback(
    async (payload) => {
      const res = await authApi.login(payload)
      saveToken(res?.token || '')
      setUser(res?.user || null)
      return res
    },
    [saveToken],
  )

  const verify = useCallback(
    async (payload) => {
      const res = await authApi.verifyCode(payload)
      saveToken(res?.token || '')
      setUser(res?.user || null)
      return res
    },
    [saveToken],
  )

  const logout = useCallback(async () => {
    const t = getToken()
    try {
      if (t) await authApi.logout(t)
      else await authApi.refresh().catch(() => {})
    } finally {
      saveToken('')
      setUser(null)
    }
  }, [saveToken])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      verify,
      logout,
      refresh: async () => {
        const res = await authApi.refresh()
        if (res?.token) saveToken(res.token)
        return res
      },
      setToken: saveToken,
      setUser,
    }),
    [token, user, loading, login, verify, logout, saveToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
