import { proxy } from 'valtio'
import { User } from './User'

export const userStore = proxy<{ user?: User; authToken?: string }>(undefined)
