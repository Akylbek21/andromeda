import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, clearTokens, setTokens } from './tokens'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })

  isRefreshing = false
  failedQueue = []
}

// Request interceptor: add Authorization header if token exists
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Не добавляем токен для публичных auth эндпоинтов
    const url = config.url || ''
    const isAuthEndpoint = url.includes('/auth/send-code') || 
                          url.includes('/auth/login') || 
                          url.includes('/auth/refresh')
    
    if (!isAuthEndpoint) {
      const token = getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 with token refresh
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return http(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 15000 }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data
        setTokens({ accessToken, refreshToken: newRefreshToken })
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        processQueue(refreshError as AxiosError, null)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default http
