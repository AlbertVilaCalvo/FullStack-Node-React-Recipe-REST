import type { Location } from 'react-router-dom'

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
