import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('mot_user') || 'null'))
  const token = ref(localStorage.getItem('mot_token') || null)

  const isLoggedIn = computed(() => !!token.value)

  function _persist(t, u) {
    token.value = t
    user.value  = u
    localStorage.setItem('mot_token', t)
    localStorage.setItem('mot_user', JSON.stringify(u))
  }

  async function login(credentials) {
    const { data } = await authApi.login(credentials)
    _persist(data.token, data.client)
    return data
  }

  async function register(payload) {
    const { data } = await authApi.register(payload)
    _persist(data.token, data.client)
    return data
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    token.value = null
    user.value  = null
    localStorage.removeItem('mot_token')
    localStorage.removeItem('mot_user')
  }

  async function fetchMe() {
    const { data } = await authApi.me()
    user.value = data
    localStorage.setItem('mot_user', JSON.stringify(data))
    return data
  }

  return { user, token, isLoggedIn, login, register, logout, fetchMe }
})
