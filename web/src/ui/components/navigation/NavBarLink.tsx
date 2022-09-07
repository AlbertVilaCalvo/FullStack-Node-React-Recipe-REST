import { NavLink, NavLinkProps, useLocation } from 'react-router-dom'

export function NavBarLink(props: NavLinkProps) {
  const location = useLocation()

  // When we are at (eg) /settings/email we also want to activate the Settings
  // link at navbar, which by default would not activate because it points to
  // /settings/profile.
  const settingsActive =
    location.pathname.indexOf('/settings/') === 0 &&
    typeof props.to === 'string' &&
    props.to.indexOf('/settings/') === 0

  return (
    <NavLink
      style={({ isActive }) => {
        return {
          color: isActive || settingsActive ? 'red' : '',
        }
      }}
      {...props}
    />
  )
}
