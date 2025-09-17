import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the footer', () => {
  render(<App />)
  const footerText = screen.getByText(/The best recipe manager app/i)
  expect(footerText).toBeInTheDocument()
})
