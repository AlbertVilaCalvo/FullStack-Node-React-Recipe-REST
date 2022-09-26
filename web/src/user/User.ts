export type User = {
  readonly id: number
  name: string
  email: string
  email_verified: boolean
}

export type PublicUser = Pick<User, 'id' | 'name'>
