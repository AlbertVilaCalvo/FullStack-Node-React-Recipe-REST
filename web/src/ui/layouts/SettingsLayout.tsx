import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { H1 } from '../components/Headers'
import { SettingsNavLink } from '../components/navigation/SettingsNavLink'

export function SettingsLayout() {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Settings</H1>
        <div className="settings-container">
          <div>
            <nav>
              <ul className="list-style-type-none">
                <li>
                  <SettingsNavLink to="/settings/profile">
                    Profile
                  </SettingsNavLink>
                </li>
                <li>
                  <SettingsNavLink to="/settings/email">Email</SettingsNavLink>
                </li>
                <li>
                  <SettingsNavLink to="/settings/password">
                    Password
                  </SettingsNavLink>
                </li>
                <li>
                  <SettingsNavLink to="/settings/delete-account">
                    Delete Account
                  </SettingsNavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
