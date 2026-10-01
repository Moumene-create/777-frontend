const DEFAULT_INSTRUCTOR_PHOTOS = {
  '7.77 Training Team': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  '7.77 Security Team': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
}

function TrainingCard({
  title = '',
  description = '',
  date = '',
  time = '',
  duration = '',
  instructor = '',
  instructorImage,
  registeredCount = 0,
  maxCapacity = 100,
  isRegistered = false,
  onRegister,
  onUnregister,
}) {
  const isFull = registeredCount >= maxCapacity
  const spotsRemaining = Math.max(0, maxCapacity - registeredCount)
  const fillPercentage = Math.min(100, Math.max(0, Math.round((registeredCount / maxCapacity) * 100)))
  const isUrgent = !isFull && spotsRemaining <= 5

  const photoSrc =
    instructorImage ||
    DEFAULT_INSTRUCTOR_PHOTOS[instructor] ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'

  return (
    <article
      className={`training-card 
      ${isRegistered ? 'training-card--registered' : ''} 
      ${isFull ? 'training-card--full' : ''} 
      ${isUrgent ? 'training-card--urgent' : ''}`}
    >
      {/* Top Banner: Instructor Photo with seamless fade-out gradient */}
      <div className="training-card__instructor-banner">
        <img
          src={photoSrc}
          alt={instructor ? `Instructor ${instructor}` : 'Session instructor'}
          className="training-card__instructor-img"
          loading="lazy"
        />
        <div className="training-card__instructor-fade" aria-hidden="true" />
      </div>

      {/* Card Content Body */}
      <div className="training-card__body">
        <h2 className="training-card__title">
          {title}
        </h2>

        <p className="training-card__description">
          {description}
        </p>

        {/* Clean Typographic Metadata Grid (No Icons) */}
        <div className="training-card__details">
          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Date</span>
            <span className="training-card__detail-value">{date}</span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Time</span>
            <span className="training-card__detail-value">{time}</span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Duration</span>
            <span className="training-card__detail-value">{duration}</span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Instructor</span>
            <span className="training-card__detail-value" title={instructor}>{instructor}</span>
          </div>
        </div>

        {/* Places Filled & Progress Bar */}
        <div className="training-card__capacity">
          <div className="training-card__capacity-header">
            <span className="training-card__capacity-label">Places Filled</span>
            <span className="training-card__capacity-count">
              <strong>{registeredCount}</strong> / {maxCapacity}
            </span>
          </div>

          <div
            className="training-card__capacity-bar"
            role="progressbar"
            aria-valuenow={registeredCount}
            aria-valuemin="0"
            aria-valuemax={maxCapacity}
            aria-label={`${registeredCount} of ${maxCapacity} places filled`}
          >
            <div
              className="training-card__capacity-fill"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className={`training-card__button ${
            isRegistered
              ? 'training-card__button--registered'
              : isFull
                ? 'training-card__button--full'
                : 'training-card__button--register'
          }`}
          onClick={isRegistered ? onUnregister : onRegister}
          disabled={isFull && !isRegistered}
          aria-disabled={isFull && !isRegistered}
        >
          {isFull && !isRegistered ? (
            'Registration full'
          ) : isRegistered ? (
            <>
              <span className="training-card__btn-text-enrolled">Enrolled</span>
              <span className="training-card__btn-text-cancel">Cancel registration</span>
            </>
          ) : (
            'Register'
          )}
        </button>
      </div>
    </article>
  )
}

export default TrainingCard