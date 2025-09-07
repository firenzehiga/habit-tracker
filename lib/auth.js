"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`)
      if (response.data && !response.data.error) {
        setUser(response.data.data)
      } else {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }
    } catch (error) {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      })

      if (response.data && !response.data.error) {
        const { token, user } = response.data.data
        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setUser(user)
        router.push("/dashboard")
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        email,
        password,
      })

      if (response.data && !response.data.error) {
        const { token, user } = response.data.data
        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setUser(user)
        router.push("/dashboard")
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
