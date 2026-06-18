// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { IDENTITY_VERIFY_URL } from '../config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Capture token before Router redirects clear the URL
    const [urlToken] = useState(() => new URLSearchParams(window.location.search).get('token'))

    useEffect(() => {
        const initAuth = async () => {
            if (urlToken) {
                localStorage.setItem('accessToken', urlToken)
                window.history.replaceState({}, '', window.location.pathname)
            }

            const currentToken = localStorage.getItem('accessToken')
            if (!currentToken) {
                setLoading(false)
                return
            }

            const savedUser = localStorage.getItem('user')
            if (savedUser) {
                setUser(JSON.parse(savedUser))
            }

            try {
                const response = await axios.post(
                    IDENTITY_VERIFY_URL,
                    {},
                    { headers: { Authorization: `Bearer ${currentToken}` } }
                )
                const verifiedUser = response.data?.data?.user
                if (verifiedUser) {
                    localStorage.setItem('user', JSON.stringify(verifiedUser))
                    setUser(verifiedUser)
                }
            } catch (error) {
                console.error('Token verification failed', error)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('user')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [urlToken])

    const isAuthenticated = !!localStorage.getItem('accessToken')
    const getToken = () => localStorage.getItem('accessToken')

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setUser(null)
        window.location.href = 'http://localhost:3000/login'
    }

    const login = (userData, loginToken) => {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('accessToken', loginToken)
        setUser(userData)
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, getToken, logout, login }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}