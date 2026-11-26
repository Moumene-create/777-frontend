import { useEffect, useState } from 'react'
import { getPublicInstructors } from '../api/instructors'
import './InstructorCarousel.css'

// Three identical groups make the -100% / 3 loop seamless and keep the track
// longer than the viewport plus one group on large screens.
const GROUPS = 3
const SECONDS_PER_CARD = 6.33

function InstructorCard({ instructor }) {
  return (
    <li className="instructor-card">
      <img
        className="instructor-card__photo"
        src={instructor.photoSrc}
        alt={`Portrait of ${instructor.fullName}`}
        loading="lazy"
        decoding="async"
      />
      <p className="instructor-card__name">{instructor.fullName}</p>
      {instructor.bio && (
        <p className="instructor-card__bio">{instructor.bio}</p>
      )}
    </li>
  )
}

export default function InstructorCarousel() {
  const [instructors, setInstructors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getPublicInstructors()

        if (isActive) {
          setInstructors(data)
        }
      } catch (requestError) {
        if (isActive) {
          setInstructors([])
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [reloadKey])

  const animationDuration = `${Math.max(
    1,
    Math.round(instructors.length * SECONDS_PER_CARD)
  )}s`

  function renderCards(prefix) {
    return instructors.map((instructor) => (
      <InstructorCard
        key={`${prefix}${instructor.id}`}
        instructor={instructor}
      />
    ))
  }

  return (
    <section
      className="instructor-carousel"
      aria-labelledby="instructors-title"
    >
      <header className="instructor-carousel__heading">
        <p className="instructor-carousel__eyebrow">Our instructors</p>
        <h2 id="instructors-title">
          Meet the people leading the sessions
        </h2>
        <p>
          Trainers from the 7.77 programme share their expertise with every
          age category.
        </p>
      </header>

      {isLoading ? (
        <p className="instructor-carousel__status" role="status">
          Loading featured instructors…
        </p>
      ) : error ? (
        <div className="instructor-carousel__status" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="instructor-carousel__retry"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : instructors.length === 0 ? (
        <p className="instructor-carousel__status">
          Featured instructors will appear here soon.
        </p>
      ) : (
        <div className="instructor-carousel__viewport">
          <div
            className="instructor-carousel__track"
            style={{ animationDuration }}
          >
            {Array.from({ length: GROUPS }, (_, groupIndex) => (
              <ul
                className="instructor-carousel__group"
                key={`group-${groupIndex}`}
                aria-hidden={groupIndex > 0 || undefined}
              >
                {renderCards(`g${groupIndex}-`)}
              </ul>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
