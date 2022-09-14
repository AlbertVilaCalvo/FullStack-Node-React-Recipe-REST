# Notes

## Check errors in a try-catch of a database query

https://stackoverflow.com/questions/64452484/how-can-i-safely-access-caught-error-properties-in-typescript

https://stackoverflow.com/questions/69422525/in-typescript-try-catch-error-object-shows-object-is-of-type-unknown-ts25

```ts
import { DatabaseError } from 'pg'

try {
} catch (error: unknown) {
  if (
    error instanceof DatabaseError && // <-- this does the trick
    error.code === '23505' &&
    error.constraint === 'user_email_key'
  ) {
    return toError(error)
  }
}
```
