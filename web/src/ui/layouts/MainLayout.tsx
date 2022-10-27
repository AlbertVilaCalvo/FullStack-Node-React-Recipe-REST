import { Outlet, useNavigate } from 'react-router-dom'
import { NavBarLink } from '../components/navigation/NavBarLink'
import { useSnapshot } from 'valtio'
import { userStore } from '../../user/userStore'

export function MainLayout() {
  const navigate = useNavigate()
  const storedUser = useSnapshot(userStore)

  return (
    <>
      <header className="main-container header">
        <nav className="main-container-child-centered">
          <ul className="list-style-type-none">
            <li>
              <NavBarLink to="/" end>
                Home
              </NavBarLink>
            </li>
            <li>
              <NavBarLink to="/recipes/new">Create Recipe</NavBarLink>
            </li>
            <li>
              <NavBarLink to="/about">About</NavBarLink>
            </li>
            <li aria-hidden="true" className="nav-spacer"></li>
            {storedUser.user ? (
              <>
                <li>
                  <NavBarLink to="/settings/profile">Settings</NavBarLink>
                </li>
                <li>
                  <NavBarLink
                    to="/logout"
                    onClick={(event) => {
                      event.preventDefault() // prevent navigating to /logout
                      userStore.user = undefined
                      userStore.authToken = undefined
                      navigate('/')
                    }}
                  >
                    Logout
                  </NavBarLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavBarLink to="/register">Register</NavBarLink>
                </li>
                <li>
                  <NavBarLink to="/login">Login</NavBarLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <Outlet />

      <footer className="main-container footer">
        <div className="main-container-child-centered">
          <div id="footer-content">
            <p>The best recipe manager app! 🍽️</p>
          </div>
        </div>
      </footer>
    </>
  )
}
