import type { NavLinkProps } from 'react-router-dom'
import { NavLink } from 'react-router-dom'

export function SettingsNavLink(props: NavLinkProps) {
  return (
    <NavLink
      style={({ isActive }) => {
        return {
          color: isActive ? 'red' : '',
        }
      }}
      {...props}
    />
  )
}
