import { proxy } from 'valtio'
import type { User } from './User'

export const userStore = proxy<{ user?: User; authToken?: string }>(undefined)
