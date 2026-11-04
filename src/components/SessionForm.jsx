import { useState } from 'react'
import { Link } from 'react-router-dom'
import './SessionForm.css'

const trainingTypes = [
  { id: 'ai-intro', name: 'Introduction to Artificial Intelligence' },
  { id: 'cybersecurity', name: 'Cybersecurity Basics' },
  { id: 'web-development', name: 'Introduction to Web Development' },
]

const ageCategories = [
  '7-10',
  '11-14',
  '15-17',
  '18-23',
  '24-30',
  '31-45',
  '46-60',
]

const initialForm = {
  trainingId: '',
  title: '',
  description: '',
  date: '',
  time: '',
  durationMinutes: '60',
  maxCapacity: '100',
  instructor: '',
  instructor_email: '',
  instructor_phone: '',
  Prerequisites: '',
  zoomUrl: '',
  targetAgeCategories: [],
}

export default function SessionForm({
  initialValues = {},
  submitLabel = 'Create session',
}) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...initialValues,
    targetAgeCategories: [
      ...(initialValues.targetAgeCategories || []),
    ],
  }))

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleCategoryChange(event) {
    const { value, checked } = event.target

    setForm((current) => ({
      ...current,
      targetAgeCategories: checked
        ? [...current.targetAgeCategories, value]
        : current.targetAgeCategories.filter(
            (category) => category !== value
          ),
    }))
  }

  return (
    <form
        className="session-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="session-form__section">
          <legend>Training information</legend>

          <div className="session-form__grid">
            <label className="session-form__field">
              <span>Training type</span>
              <select
                name="trainingId"
                value={form.trainingId}
                onChange={handleChange}
                required
              >
                <option value="">Select a training type</option>

                {trainingTypes.map((training) => (
                  <option key={training.id} value={training.id}>
                    {training.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="session-form__field">
              <span>Session title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field session-form__field--wide">
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </label>


            <label className="session-form__field session-form__field--wide_one">
              <span>Prerequisites</span>
              <input
                name="Prerequisites"
                value={form.Prerequisites}
                onChange={handleChange}
                required
              />
            </label>


     <div className="session-form__row-three">
            <label className="session-form__field">
              <span>Instructor's name</span>
              <input
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field">
              <span>Instructor email</span>
              <input
                name="instructor_email"
                type="email"
                value={form.instructor_email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field">
              <span>Instructor phone</span>
              <input
                name="instructor_phone"
                type="tel"
                value={form.instructor_phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          </div>
        </fieldset>

        <fieldset className="session-form__section">
          <legend>Schedule and capacity</legend>

          <div className="session-form__grid">
            <label className="session-form__field">
              <span>Date</span>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field">
              <span>Start time</span>
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field">
              <span>Duration in minutes</span>
              <input
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                value={form.durationMinutes}
                onChange={handleChange}
                required
              />
            </label>

            <label className="session-form__field">
              <span>Maximum participants</span>
              <input
                name="maxCapacity"
                type="number"
                min="1"
                step="1"
                value={form.maxCapacity}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="session-form__section">
          <legend>Target age categories</legend>
          <p>Select one or more categories.</p>

          <div className="session-form__categories">
            {ageCategories.map((category) => (
              <label
                className="session-form__category"
                key={category}
              >
                <input
                  type="checkbox"
                  name="targetAgeCategories"
                  value={category}
                  checked={form.targetAgeCategories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="session-form__section">
          <legend>Meeting access</legend>

          <label className="session-form__field">
            <span>Zoom meeting URL</span>
            <input
              name="zoomUrl"
              type="url"
              value={form.zoomUrl}
              onChange={handleChange}
              placeholder="https://…"
              aria-describedby="session-zoom-hint"
              required
            />
          </label>

          <p id="session-zoom-hint">
            Restricted meeting information. Do not display this URL in
            participant session lists or details.
          </p>
        </fieldset>

        <div className="session-form__actions">
          <Link to="/manager/sessions">Cancel</Link>

        <button
        type="submit"
        disabled
        aria-describedby="session-save-hint"
        >
        {submitLabel}
        </button>
        </div>

        
      </form>
  )
}