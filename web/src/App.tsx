import * as React from 'react'
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainContainer } from './MainContainer'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CreateRecipePage } from './pages/CreateRecipePage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainContainer />}>
            <Route path="" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="recipes/new" element={<CreateRecipePage />} />
            <Route path="recipes/:recipeId" element={<RecipeDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
