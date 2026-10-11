import './HowItWorks.css'

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description:
      'Register with your information so the platform can identify the training sessions available for your age category.',
  },
  {
    number: '02',
    title: 'Choose a session',
    description:
      'Explore available training sessions and register for the one that interests you.',
  },
  {
    number: '03',
    title: 'Join securely',
    description:
      'Access your Zoom session directly from the platform when the session is ready to begin.',
  },
]

function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="how-it-works__content">
        <div className="how-it-works__heading">
          <p className="how-it-works__eyebrow">Simple and secure</p>

          <h2 id="how-it-works-title">How the platform works</h2>

          <p>
            Everything you need to discover, join, and follow your training
            sessions in one place.
          </p>
        </div>

        <ol className="how-it-works__steps">
          {steps.map((step) => (
            <li className="how-it-works__step" key={step.number}>
              <span className="how-it-works__number">{step.number}</span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks