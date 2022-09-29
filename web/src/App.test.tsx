import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the footer', () => {
  render(<App />)
  const footerText = screen.getByText(/The best recipe app/i)
  expect(footerText).toBeInTheDocument()
})
