// Type guards/predicates for the result union type T | Error.
// See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates.

export function isSuccess<T>(arg: T | Error): arg is T {
  return !(arg instanceof Error)
}

export function isError<T>(arg: T | Error): arg is Error {
  return arg instanceof Error
}
