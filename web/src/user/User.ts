export type User = {
  readonly id: number
  name: string
  email: string
}

export type PublicUser = Omit<User, 'email' | 'password'>
