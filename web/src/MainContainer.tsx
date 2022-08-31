import { Outlet, useNavigate } from 'react-router-dom'
import { CustomNavLink } from './components/CustomNavLink'
import { useSnapshot } from 'valtio'
import { userStore } from './user/userStore'

export function MainContainer() {
  const navigate = useNavigate()
  const storedUser = useSnapshot(userStore)

  return (
    <>
      <header className="main-container">
        <nav className="main-container-child-centered">
          <ul className="list-style-type-none">
            <li>
              <CustomNavLink to="/">Home</CustomNavLink>
            </li>
            <li>
              <CustomNavLink to="/recipes/new">Create Recipe</CustomNavLink>
            </li>
            <li>
              <CustomNavLink to="/about">About</CustomNavLink>
            </li>
            <li aria-hidden="true" className="nav-spacer"></li>
            {storedUser.user ? (
              <>
                <li>
                  <CustomNavLink to="/profile">My Profile</CustomNavLink>
                </li>
                <li>
                  <CustomNavLink
                    to="/logout"
                    onClick={(event) => {
                      event.preventDefault() // prevent navigating to /logout
                      userStore.user = undefined
                      userStore.authToken = undefined
                      navigate('/')
                    }}
                  >
                    Logout
                  </CustomNavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <CustomNavLink to="/register">Register</CustomNavLink>
                </li>
                <li>
                  <CustomNavLink to="/login">Login</CustomNavLink>
                </li>
              </>
            )}
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
