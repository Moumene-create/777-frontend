import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import './SignUpPage.css'
import logo from '../assets/logo_7.svg'
import { registerUser } from '../api/auth'
import { getAgeCategoryFromDateOfBirth } from '../utils/ageCategory'

function SignUpPage({ isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    wilaya: '',
    password: '',
  });

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }; 

  const ageCategory = useMemo(
    () => getAgeCategoryFromDateOfBirth(formData.date_of_birth),
    [formData.date_of_birth]
  )
  const isPasswordTooShort = formData.password.length > 0 && formData.password.length < 8;
  const isPhonenumberTooshort =  formData.phone_number.length > 0 && formData.phone_number.length < 10;
  const isPhonenumberToolong =  formData.phone_number.length > 0 && formData.phone_number.length > 10 ;
  const isPhonenumberInvalid = isPhonenumberTooshort || isPhonenumberToolong ; 
  const isFormInvalid = isPasswordTooShort || isPhonenumberInvalid ;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || isFormInvalid) return

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await registerUser({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        date_of_birth: formData.date_of_birth,
        wilaya: formData.wilaya.trim(),
        password: formData.password,
      })

      navigate('/check-email', { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
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
            <label htmlFor="first_name">First name</label>
            <input
              id = "first_name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>
          <div className="ran-form__field">
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
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
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          </div>

          <div className="ran-form__field">
            <label htmlFor="phone_number">Phone number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}              
              autoComplete="tel"
              required
              minLength={10}
              maxLength={10}
            />

          </div>

          <div className="ran-form__field">
            <label htmlFor="date_of_birth">Date of birth</label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="ageCategory">Age category</label>
            <input
              id="ageCategory"
              name="ageCategory"
              type="text"
              value={ageCategory ?? 'Derived from your date of birth'}
              readOnly
              aria-describedby="ageCategoryHint"
            />
            <p id="ageCategoryHint" className="ran-form__hint">
              {formData.date_of_birth && ageCategory === null
                ? 'This date of birth is outside the current age categories (7 to 60). Your account may not be eligible for sessions.'
                : 'Your category is derived from your date of birth and cannot be edited.'}
            </p>
          </div>

          <div className="ran-form__field">
            <label htmlFor="wilaya">Wilaya</label>
            <input
              id="wilaya"
              name="wilaya"
              type="text"
              value={formData.wilaya}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="password">Password</label>
            <input id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              minLength={8}
            />



          </div>
            {isPhonenumberInvalid && (
              <p className="ran-form__error">
                Phone number must be exactly 10 characters.
              </p>
            )}
            {isPasswordTooShort && (
              <p className="ran-form__error">
                Password must be at least 8 characters.
              </p>
            )}
            {submitError && (
              <p className="ran-form__error">
                {submitError}
              </p>
            )}
           
          <button
            className="ran-form__submit"
            type="submit"
            disabled={isFormInvalid || isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
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