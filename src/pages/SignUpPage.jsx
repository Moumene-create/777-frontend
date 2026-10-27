import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import './SignUpPage.css'
import logo from '../assets/logo_7.svg'

function getAgeFromdateOfBirth(date_of_birth) {
  if (!date_of_birth) return null

  const today = new Date()
  const birthDate = new Date(date_of_birth)

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

function SignUpPage({onLogin, isAuthenticated, currentUser, onLogout }) {
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
  const age = useMemo(() => getAgeFromdateOfBirth(formData.date_of_birth), [formData.date_of_birth])
  const ageCategory = useMemo(() => getAgeCategory(age), [age])
  const isPasswordTooShort = formData.password.length > 0 && formData.password.length < 8;
  const isPhonenumberTooshort =  formData.phone_number.length > 0 && formData.phone_number.length < 10;
  const isPhonenumberToolong =  formData.phone_number.length > 0 && formData.phone_number.length > 10 ;
  const isPhonenumberInvalid = isPhonenumberTooshort || isPhonenumberToolong ; 
  const isFormInvalid = isPasswordTooShort || isPhonenumberInvalid ;
  function handleSubmit(event) {
  event.preventDefault();

  const userData = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone_number: formData.phone_number,
    date_of_birth: formData.date_of_birth,
    ageCategory: ageCategory,
    wilaya: formData.wilaya,
    password: formData.password,
  };

  onLogin(userData);
  navigate('/sessions');
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
              value={formData.wilaya}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ran-form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
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
          <button className="ran-form__submit" type="submit" disabled={isFormInvalid}>
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