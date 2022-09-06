import * as React from 'react'
import { Location, Navigate, useLocation } from 'react-router-dom'
import { userStore } from '../../../user/userStore'

/**
 * Use it to protect pages that require login:
 * ```
 * <Route
 *   path="recipes/:recipeId/edit"
 *   element={<RequireLogin Page={EditRecipePage} />}
 * />
 * ```
 * If the user is not logged, it will send it to the /login page. It sends the
 * user back to the protected page after logging in.
 *
 * Adapted from https://github.com/remix-run/react-router/tree/main/examples/auth
 */
export function RequireLogin({ Page }: { Page: React.ComponentType<any> }) {
  if (userStore.user) {
    return <Page />
  } else {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <NavigateToLogin />
  }
}

export function NavigateToLogin() {
  const location = useLocation()
  return <Navigate to="/login" state={{ from: location }} replace />
}

/**
 * Returns the 'from' location set by the `RequireLogin` component.
 */
export function getFromLocation(location: Location): string | undefined {
  const state = location.state as any
  if (state && state.from && state.from.pathname) {
    return state.from.pathname
  }
  return undefined
}
