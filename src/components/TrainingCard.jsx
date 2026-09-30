function TrainingCard({
  title,
  description,
  date,
  time,
  duration,
  instructor,
  registeredCount,
  maxCapacity,
  isRegistered,
  onRegister,
  onUnregister,
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

      <button 
        type="button" 
        onClick={isRegistered ? onUnregister : onRegister} 
        disabled={isFull}
        aria-disabled={isFull}
      >
        {isFull 
          ? 'Registration full' 
          : isRegistered
            ?'Unregistered'
            :'Register'
        }
      </button>
    </article>
  )
}

export default TrainingCard