export type User = {
  readonly id: number
  email: string
  /** The hashed password. */
  password: string
  name: string
}
