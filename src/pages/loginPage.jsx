function LoginPage() {


  
  return (
    <main>
      <h1>Log in</h1>

      <p>Access your 7.77 Training Platform account.</p>
      <form>
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