import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'

function LoginPage({ onLogin, isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    onLogin({
      name: 'Participant',
      email: event.target.email.value,
    })

    navigate('/sessions')
  }

  return (
    <main>
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <h1>Log in</h1>

      <p>Access your 7.77 Training Platform account.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit">Log in</button>
      </form>
    </main>
  )
}

export default LoginPage