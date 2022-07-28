import { Outlet } from 'react-router-dom'
import { CustomNavLink } from './components/CustomNavLink'

export function MainContainer() {
  return (
    <div>
      <nav>
        <CustomNavLink to="/">Home</CustomNavLink> |{' '}
        <CustomNavLink to="/recipes/new">Create Recipe</CustomNavLink> |{' '}
        <CustomNavLink to="/about">About</CustomNavLink>
      </nav>
      <Outlet />
    </div>
  )
}
