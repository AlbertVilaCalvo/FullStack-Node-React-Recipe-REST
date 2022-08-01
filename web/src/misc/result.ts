// Type guards/predicates for the result union type 'loading' | T | Error.
// See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates.

// To avoid repetition we could define the type Result<T> = 'loading' | T | Error,
// but I prefer to be explicit.

export function isLoading<T>(arg: 'loading' | T | Error): arg is 'loading' {
  return arg === 'loading'
}

export function isSuccess<T>(arg: 'loading' | T | Error): arg is T {
  return arg !== 'loading' && !(arg instanceof Error)
}

export function isError<T>(arg: 'loading' | T | Error): arg is Error {
  return arg instanceof Error
}
