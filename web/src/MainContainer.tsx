import { Outlet } from 'react-router-dom'
import { CustomNavLink } from './components/CustomNavLink'

export function MainContainer() {
  return (
    <>
      <header className="main-container">
        <nav className="main-container-child-centered">
          <ul>
            <li>
              <CustomNavLink to="/">Home</CustomNavLink>
            </li>
            <li>
              <CustomNavLink to="/recipes/new">Create Recipe</CustomNavLink>
            </li>
            <li>
              <CustomNavLink to="/about">About</CustomNavLink>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
      <footer className="main-container">
        <div className="main-container-child-centered">
          <div id="footer-content">
            <p>The best recipe app!</p>
          </div>
        </div>
      </footer>
    </>
  )
}
