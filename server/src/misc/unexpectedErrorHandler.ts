import { ErrorRequestHandler } from 'express'
import { StatusCode } from './StatusCode'

/**
 * Return 500 for unexpected errors. If this handler is called it means that our
 * code is wrong and we should fix it.
 *
 * Important: this error handler does not get invoked if the error is thrown in
 * an `async` function or callback unless you wrap the code with a try-catch
 * and call next(error).
 * See https://stackoverflow.com/questions/56973265/what-does-express-async-handler-do
 */
export const unexpectedErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  // Important: 'next' argument must be provided, even if unused! See why at
  // https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next
) => {
  console.error('Unexpected error!', err)
  res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
}
