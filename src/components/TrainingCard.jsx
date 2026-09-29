function TrainingCard({
  title,
  description,
  date,
  time,
  duration,
  instructor,
  registeredCount,
  maxCapacity,
}) {
    
const isFull = registeredCount >= maxCapacity

  return (
    <article>
      <h2>{title}</h2>

      <p>{description}</p>

      <p>Date: {date}</p>

      <p>Time: {time}</p>

      <p>Duration: {duration}</p>

      <p>Instructor: {instructor}</p>

      <p>
        Places filled: {registeredCount} / {maxCapacity}
      </p>

      <button type="button" disabled={isFull}>
        {isFull ? 'Registration full' : 'Register'}
      </button>
    </article>
  )
}

export default TrainingCard