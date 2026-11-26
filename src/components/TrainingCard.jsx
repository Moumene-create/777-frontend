import { Link } from 'react-router-dom'
import { useNow } from '../hooks/useNow'
import { getTrainingImage } from '../utils/trainingImage'
import {
  formatDuration,
  formatSessionDate,
  formatSessionTime,
} from '../utils/format'
import {
  getJoinWindow,
  getSessionStatus,
  isJoinWindowOpen,
  isSessionFull,
} from '../utils/sessionStatus'
import './TrainingCard.css'

function TrainingCard({
  session,
  isRegistered = false,
  showJoin = false,
  onJoin,
  isJoining = false,
}) {
  const now = useNow()

  if (!session) {
    return null
  }

  const status = getSessionStatus(session, now)
  const isCompleted = status === 'COMPLETED'
  const isFull = isSessionFull(session)
  const canJoin =
    showJoin &&
    isRegistered &&
    isJoinWindowOpen(session, now) &&
    typeof onJoin === 'function'

  const registeredCount = Number(session.registeredCount) || 0
  const maxCapacity = Number(session.maxCapacity) || 0
  const spotsRemaining = Math.max(0, maxCapacity - registeredCount)
  const fillPercentage =
    maxCapacity > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((registeredCount / maxCapacity) * 100))
        )
      : 0
  const isUrgent = !isFull && maxCapacity > 0 && spotsRemaining <= 5

  const photoSrc = getTrainingImage(
    session.trainingTypeDescription,
    session.title
  )
  const imageAlt = session.trainingTypeDescription
    ? `${session.trainingTypeDescription} illustration`
    : `Illustration for ${session.title}`

  const joinWindow = getJoinWindow(session)
  const joinHint =
    status === 'OPEN' && joinWindow
      ? `Zoom opens at ${joinWindow.opensAt.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : null

  return (
    <article
      className={[
        'training-card',
        isRegistered ? 'training-card--registered' : '',
        isFull ? 'training-card--full' : '',
        isUrgent ? 'training-card--urgent' : '',
        isCompleted ? 'training-card--completed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="training-card__instructor-banner">
        <img
          src={photoSrc}
          alt={imageAlt}
          className="training-card__instructor-img"
          loading="lazy"
        />
        <div className="training-card__instructor-fade" aria-hidden="true" />
      </div>

      <div className="training-card__body">
        {isCompleted && (
          <p className="training-card__completed-label">Session completed</p>
        )}

        <h2 className="training-card__title">{session.title}</h2>

        {session.trainingTypeDescription && (
          <p className="training-card__description">
            {session.trainingTypeDescription}
          </p>
        )}

        <div className="training-card__details">
          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Date</span>
            <span className="training-card__detail-value">
              {formatSessionDate(session.date)}
            </span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Time</span>
            <span className="training-card__detail-value">
              {formatSessionTime(session.startTime)}
            </span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Duration</span>
            <span className="training-card__detail-value">
              {formatDuration(session.durationMinutes)}
            </span>
          </div>

          <div className="training-card__detail-item">
            <span className="training-card__detail-label">Instructor</span>
            <span
              className="training-card__detail-value"
              title={session.instructorName}
            >
              {session.instructorName}
            </span>
          </div>
        </div>

        <div className="training-card__capacity">
          <div className="training-card__capacity-header">
            <span className="training-card__capacity-label">
              Places filled
            </span>
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

        <div className="training-card__actions">
          {canJoin ? (
            <button
              type="button"
              className="training-card__button training-card__button_view--details"
              onClick={() => onJoin(session.id)}
              disabled={isJoining}
            >
              {isJoining ? 'Joining…' : 'Join session'}
            </button>
          ) : (
            <Link
              className="training-card__button training-card__button_view--details"
              to={`/sessions/${session.id}`}
            >
              View details
            </Link>
          )}

          {showJoin && isRegistered && !canJoin && joinHint && (
            <p className="training-card__join-hint">{joinHint}</p>
          )}
        </div>
      </div>
    </article>
  )
}

export default TrainingCard
