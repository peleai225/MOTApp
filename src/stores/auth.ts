import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api'
import { normalizePhone } from '@/lib/format'
import type { Client, ProfilePayload } from '@/types'

const K_USER = 'mot_user'
const K_TOKEN = 'mot_token'

function readUser(): Client | null {
  try { return JSON.parse(localStorage.getItem(K_USER) || 'null') } catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Client | null>(readUser())
  const token = ref<string | null>(localStorage.getItem(K_TOKEN))
  const isLoggedIn = computed(() => !!token.value)
  const firstName = computed(() => user.value?.prenom || '')

  function setSession(t: string, c: Client) {
    token.value = t
    user.value = c
    localStorage.setItem(K_TOKEN, t)
    localStorage.setItem(K_USER, JSON.stringify(c))
  }

  function setUser(c: Client) {
    user.value = c
    localStorage.setItem(K_USER, JSON.stringify(c))
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(K_TOKEN)
    localStorage.removeItem(K_USER)
  }

  async function login(telephone: string, password: string) {
    const { data } = await authApi.login({ telephone: normalizePhone(telephone), password })
    setSession(data.token, data.client)
    return data.client
  }

  async function register(payload: { nom: string; prenom: string; telephone: string; email?: string; password: string; password_confirmation: string }) {
    const body = { ...payload, telephone: normalizePhone(payload.telephone) }
    if (!body.email) delete body.email
    const { data } = await authApi.register(body)
    setSession(data.token, data.client)
    return data.client
  }

  async function logout() {
    try { await authApi.logout() } catch { /* jeton déjà invalide : rien à faire */ }
    clear()
  }

  async function fetchMe() {
    if (!token.value) return
    const { data } = await authApi.me()
    setUser(data)
  }

  async function updateProfile(payload: ProfilePayload) {
    const { data } = await authApi.update(payload)
    setUser({ ...user.value, ...data.client })
    return data.client
  }

  return { user, token, isLoggedIn, firstName, login, register, logout, fetchMe, updateProfile, clear }
})
