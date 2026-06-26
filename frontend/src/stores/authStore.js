// stores/authStore.js
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    initialized: false
  }),
  actions: {
    setUser(userData) {
      this.user = userData 
      localStorage.setItem('user', JSON.stringify(userData))
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    async init() {
      if (this.initialized || !this.token) return
      try {
        const response = await api.get('/auth/me')
        const user = response.data?.data
        if (user) {
          this.user = user
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (err) {
        console.error('Auth init failed:', err)
        if (err.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.initialized = true
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.initialized = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})