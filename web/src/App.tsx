import * as React from 'react'
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './ui/layouts/MainLayout'
import { SettingsLayout } from './ui/layouts/SettingsLayout'
import { HomePage } from './ui/pages/HomePage'
import { AboutPage } from './ui/pages/AboutPage'
import { NotFound404Page } from './ui/pages/NotFound404Page'
import { RegisterPage } from './ui/pages/auth/RegisterPage'
import { LoginPage } from './ui/pages/auth/LoginPage'
import { VerifyEmailPage } from './ui/pages/auth/VerifyEmailPage'
import { UserDetailPage } from './ui/pages/user/UserDetailPage'
import { MyProfilePage } from './ui/pages/settings/MyProfilePage'
import { ChangeEmailPage } from './ui/pages/settings/ChangeEmailPage'
import { ChangePasswordPage } from './ui/pages/settings/ChangePasswordPage'
import { DeleteAccountPage } from './ui/pages/settings/DeleteAccountPage'
import { CreateRecipePage } from './ui/pages/recipe/CreateRecipePage'
import { RecipeDetailPage } from './ui/pages/recipe/RecipeDetailPage'
import { EditRecipePage } from './ui/pages/recipe/EditRecipePage'
import { RequireLogin } from './ui/components/navigation/RequireLogin'

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />

            <Route
              path="settings"
              element={<RequireLogin Page={SettingsLayout} />}
            >
              <Route path="profile" element={<MyProfilePage />} />
              <Route path="email" element={<ChangeEmailPage />} />
              <Route path="password" element={<ChangePasswordPage />} />
              <Route path="delete-account" element={<DeleteAccountPage />} />
            </Route>

            <Route path="users/:userId" element={<UserDetailPage />} />

            <Route
              path="recipes/new"
              element={<RequireLogin Page={CreateRecipePage} />}
            />
            <Route path="recipes/:recipeId" element={<RecipeDetailPage />} />
            <Route
              path="recipes/:recipeId/edit"
              element={<RequireLogin Page={EditRecipePage} />}
            />

            <Route path="*" element={<NotFound404Page />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
