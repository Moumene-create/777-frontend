import { useState } from 'react'
import { Link } from 'react-router-dom'
import './BaguiHero1.css'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isAvailable(date) {
  const weekday = date.getDay()
  return weekday !== 0 && weekday !== 6 && date >= startOfDay(new Date())
}

function getNextAvailableDate() {
  const date = startOfDay(new Date())
  date.setDate(date.getDate() + 1)

  while (!isAvailable(date)) {
    date.setDate(date.getDate() + 1)
  }

  return date
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ direction = 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={
        direction === 'left' ? 'session-calendar__chevron--left' : undefined
      }
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle
        cx="8"
        cy="8"
        r="5.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M8 4.75V8l2.1 1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect
        x="2"
        y="4.25"
        width="8.25"
        height="7.5"
        rx="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="m10.25 7 3.25-1.8v5.6L10.25 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle
        cx="8"
        cy="8"
        r="5.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 8h11M8 2.25c1.5 1.6 2.2 3.6 2.2 5.75S9.5 12.15 8 13.75C6.5 12.15 5.8 10.15 5.8 8S6.5 3.85 8 2.25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  )
}

export default function BaguiHero1({ isAuthenticated = false }) {
  const [selectedDate, setSelectedDate] = useState(getNextAvailableDate)
  const [viewDate, setViewDate] = useState(() => {
    const start = getNextAvailableDate()
    return { year: start.getFullYear(), month: start.getMonth() }
  })

  function changeMonth(offset) {
    setViewDate(({ year, month }) => {
      const next = new Date(year, month + offset, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  function selectDay(day) {
    const date = new Date(viewDate.year, viewDate.month, day)
    if (isAvailable(date)) {
      setSelectedDate(date)
    }
  }

  const monthName = new Date(
    viewDate.year,
    viewDate.month,
    1
  ).toLocaleDateString('en-US', { month: 'long' })

  const leadingBlanks = new Date(viewDate.year, viewDate.month, 1).getDay()
  const daysInMonth = new Date(
    viewDate.year,
    viewDate.month + 1,
    0
  ).getDate()

  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const today = startOfDay(new Date())

  return (
    <section
      className="bagui-hero home-section"
      aria-label="7.77 platform hero"
    >
      <div className="bagui-hero__copy">
        <Link className="bagui-hero__badge" to="/sessions">
          New sessions are open
          <ChevronIcon />
        </Link>

        <h1 className="bagui-hero__title">
          The better way to
          <br />
          learn digital skills
        </h1>

        <p className="bagui-hero__description">
          Live, hands-on sessions for every age and level, with trainers who
          make digital feel simple.
        </p>

        <div className="bagui-hero__actions">
          <Link className="bagui-hero__button" to="/sessions">
            <ArrowIcon />
            Browse sessions
          </Link>

          <Link
            className="bagui-hero__button-secondary"
            to={isAuthenticated ? '/my-sessions' : '/signup'}
          >
            {isAuthenticated ? 'My sessions' : 'Create an account'}
          </Link>
        </div>

        <p className="bagui-hero__note">No prior experience required</p>
      </div>

      <div className="bagui-hero__preview">
        <div className="bagui-hero__card">
          <div className="session-preview__info">
            <div className="session-preview__avatar" aria-hidden="true">
              7.77
            </div>

            <p className="session-preview__name">7.77 Programme</p>

            <h2 className="session-preview__title">
              Digital Skills Essentials
            </h2>

            <p className="session-preview__description">
              A practical first step into everyday digital tools.
            </p>

            <div className="session-preview__meta">
              <div>
                <ClockIcon />
                <span>60 mins</span>
              </div>
              <div>
                <VideoIcon />
                <span>Online session</span>
              </div>
              <div>
                <GlobeIcon />
                <span>Algeria</span>
              </div>
            </div>

            <div className="session-preview__date" aria-live="polite">
              <p>{formatDate(selectedDate)}</p>
            </div>
          </div>

          <div className="session-calendar">
            <div className="session-calendar__header">
              <h3>
                {monthName} <span>{viewDate.year}</span>
              </h3>

              <div className="session-calendar__nav">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronIcon />
                </button>
              </div>
            </div>

            <div className="session-calendar__weekdays" aria-hidden="true">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="session-calendar__grid">
              {cells.map((day, index) => {
                if (day === null) {
                  return (
                    <span
                      key={`blank-${index}`}
                      className="session-calendar__blank"
                    />
                  )
                }

                const date = new Date(viewDate.year, viewDate.month, day)
                const available = isAvailable(date)
                const selected =
                  selectedDate.getFullYear() === viewDate.year &&
                  selectedDate.getMonth() === viewDate.month &&
                  selectedDate.getDate() === day
                const isToday = date.getTime() === today.getTime()

                return (
                  <button
                    key={day}
                    type="button"
                    className={[
                      'session-calendar__day',
                      selected ? 'session-calendar__day--selected' : '',
                      !available ? 'session-calendar__day--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={!available}
                    aria-pressed={selected}
                    aria-label={formatDate(date)}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                    {isToday && !selected && (
                      <span
                        className="session-calendar__today"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bagui-hero__fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
