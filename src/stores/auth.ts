import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    localStorage.getItem('mot_user') ? JSON.parse(localStorage.getItem('mot_user')!) : null
  )
  const token = ref<string | null>(localStorage.getItem('mot_token'))
  const isLoggedIn = computed(() => !!token.value)

  function _persist() {
    if (user.value) localStorage.setItem('mot_user', JSON.stringify(user.value))
    if (token.value) localStorage.setItem('mot_token', token.value)
  }

  async function login(telephone: string, password: string) {
    const { data } = await authApi.login({ telephone, password })
    token.value = data.token; user.value = data.user; _persist()
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const { data } = await authApi.register(payload)
    token.value = data.token; user.value = data.user; _persist()
  }

  function logout() {
    authApi.logout().catch(() => {})
    token.value = null; user.value = null
    localStorage.removeItem('mot_token'); localStorage.removeItem('mot_user')
  }

  async function fetchMe() {
    const { data } = await authApi.me()
    user.value = data; localStorage.setItem('mot_user', JSON.stringify(data))
  }

  return { user, token, isLoggedIn, login, register, logout, fetchMe }
})
