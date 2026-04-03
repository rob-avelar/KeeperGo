import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { apiClient } from './api'
import type { AuthUser } from '@keepergo/shared-types'

const SESSION_TOKEN_KEY = 'keepergo_session_token'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  sessionToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
}

async function registerPushToken() {
  if (!Device.isDevice) return
  try {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return
    const token = (await Notifications.getExpoPushTokenAsync()).data
    await apiClient.savePushToken(token)
  } catch {
    // Push token é opcional — falha silenciosa
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  sessionToken: null,

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY)
      if (token) {
        apiClient.setSessionToken(token)
        const user = await apiClient.getProfile()
        set({ user, sessionToken: token, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY)
      apiClient.clearSessionToken()
      set({ isLoading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    const { sessionToken } = await apiClient.signIn(email, password)
    apiClient.setSessionToken(sessionToken)
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken)
    const user = await apiClient.getProfile()
    set({ user, sessionToken })
    registerPushToken()
  },

  signOut: async () => {
    try {
      await apiClient.deletePushToken()
    } catch {
      // Ignora erro ao deletar token
    }
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY)
    apiClient.clearSessionToken()
    set({ user: null, sessionToken: null })
  },
}))
