export type User = {
  readonly id: number
  email: string
  /** The hashed password. */
  password: string
  name: string
}

export type UserNoPassword = Omit<User, 'password'>

export function removePassword(user: User): UserNoPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user
  return rest
}

export type PublicUser = Omit<User, 'email' | 'password'>

export function removeEmailPassword(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, password, ...rest } = user
  return rest
}
