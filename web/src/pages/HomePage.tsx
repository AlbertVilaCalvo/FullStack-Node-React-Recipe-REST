import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div>
      <p>Home Page</p>
      <Link to={`/recipes/3267`}>Escalivada</Link>
    </div>
  )
}
