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
