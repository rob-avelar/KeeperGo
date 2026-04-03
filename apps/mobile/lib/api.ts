import { KeeperGoApiClient } from '@keepergo/api-client'
import Constants from 'expo-constants'

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://www.keepergo.nl'

export const apiClient = new KeeperGoApiClient(API_URL)
