import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import './SignUpPage.css'
import logo from '../assets/logo_7.svg'

function getAgeFromDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return null

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  const dayDifference = today.getDate() - birthDate.getDate()

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1
  }

  return age
}

function getAgeCategory(age) {
  if (age === null || Number.isNaN(age)) return ''

  if (age >= 7 && age <= 10) return '7-10'
  if (age >= 11 && age <= 14) return '11-14'
  if (age >= 15 && age <= 17) return '15-17'
  if (age >= 18 && age <= 23) return '18-23'
  if (age >= 24 && age <= 30) return '24-30'
  if (age >= 31 && age <= 45) return '31-45'
  if (age >= 46 && age <= 60) return '46-60'
  if (age >= 61 && age <= 77) return '61-77'

  return 'Outside current platform categories'
}

function SignUpPage({ onLogin, isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()
  const [dateOfBirth, setDateOfBirth] = useState('')

  const age = useMemo(() => getAgeFromDateOfBirth(dateOfBirth), [dateOfBirth])
  const ageCategory = useMemo(() => getAgeCategory(age), [age])

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    const userData = {
      firstname: formData.get('firstname'),
      lastname : formData.get('lastname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dateOfBirth'),
      ageCategory,
      wilaya: formData.get('wilaya'),
    }

    onLogin(userData)
    navigate('/sessions')
  }

return (
  <main className="ran-page">
    <PublicHeader
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      onLogout={onLogout}
    />
    <section className="ran-page__section ran-page__section--split">
  <div className="signup-layout">
    <div className="signup-layout__image">
      <img src={logo} alt="7.77 training platform" />
    </div>

    <div className="signup-layout__content">
      <div className="ran-card ran-card--signup">
        <div className="ran-card__header">
          <h1>Create your account</h1>
          <p>
            Join the 7.77 Training Platform to discover and register for
            training sessions.
          </p>
        </div>

        <form className="ran-form" onSubmit={handleSubmit}>
          <div className="ran-form__field">
            <label htmlFor="firstname">First name</label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              autoComplete="name"
              required
            />
          </div>
          <div className="ran-form__field">
            <label htmlFor="lastname">Last name</label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              autoComplete="name"
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="ageCategory">Age category</label>
            <input
              id="ageCategory"
              name="ageCategory"
              type="text"
              value={ageCategory}
              readOnly
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="wilaya">Wilaya</label>
            <input
              id="wilaya"
              name="wilaya"
              type="text"
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <button className="ran-form__submit" type="submit">
            Create account
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
  </main>
)
}

export default SignUpPage