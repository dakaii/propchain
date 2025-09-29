import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: string
  email: string
  walletAddress: string
  kycStatus: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData
      localStorage.setItem('token', access_token)

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Invalid credentials' }
    }
  }

  async function register(email: string, password: string) {
    try {
      const response = await axios.post('/api/auth/register', { email, password })
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData
      localStorage.setItem('token', access_token)

      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Initialize auth header if token exists
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout
  }
})