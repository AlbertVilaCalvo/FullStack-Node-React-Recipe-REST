import * as React from 'react'
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainContainer } from './MainContainer'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { NotFound404Page } from './pages/NotFound404Page'
import { RegisterPage } from './pages/auth/RegisterPage'
import { LoginPage } from './pages/auth/LoginPage'
import { MyProfilePage } from './pages/user/MyProfilePage'
import { CreateRecipePage } from './pages/recipe/CreateRecipePage'
import { RecipeDetailPage } from './pages/recipe/RecipeDetailPage'
import { EditRecipePage } from './pages/recipe/EditRecipePage'
import { RequireLogin } from './components/navigation/RequireLogin'

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainContainer />}>
            <Route path="" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="profile"
              element={<RequireLogin Page={MyProfilePage} />}
            />

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
