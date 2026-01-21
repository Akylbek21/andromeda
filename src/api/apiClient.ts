import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens, type Tokens } from '../auth/tokens'

const api: AxiosInstance = axios.create({
  baseURL: '', // empty to allow Vite proxy
})

let refreshPromise: Promise<Tokens> | null = null

const loginRedirect = () => {
  clearTokens()
  window.location.href = '/login'
}

const doRefresh = async (): Promise<Tokens> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  const { data } = await axios.post<Tokens>('/api/v1/auth/refresh', { refreshToken })
  setTokens(data)
  return data
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      loginRedirect()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = doRefresh()
    }

    try {
      const tokens = await refreshPromise
      const token = tokens.accessToken
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (refreshError) {
      loginRedirect()
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }
  }
)

export { api }
