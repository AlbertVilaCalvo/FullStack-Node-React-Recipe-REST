/**
 * Use it to ensure that a switch is exhaustive.
 * From https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(switchParameter: never): never {
  throw Error('Unreachable code violation')
}
