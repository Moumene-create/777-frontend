import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InstructorForm from './InstructorForm'
import SearchableSelect from './SearchableSelect'
import { createInstructor, getInstructors } from '../api/instructors'
import { getTrainingTypes } from '../api/trainingTypes'
import { getAgeCategoryLabels } from '../utils/ageCategory'
import { getSessionSaveErrorMessage } from '../utils/sessionSaveError'
import './SessionForm.css'

const NEW_TRAINING_OPTION = '__new__'

const emptyForm = {
  trainingId: '',
  trainingMode: 'existing',
  newTrainingCode: '',
  newTrainingName: '',
  newTrainingDescription: '',
  title: '',
  description: '',
  date: '',
  time: '',
  durationMinutes: '60',
  maxCapacity: '100',
  zoomUrl: '',
  prerequisites: '',
  targetAgeCategories: [],
}

function createInitialForm(initialValues, mode) {
  return {
    ...emptyForm,
    ...initialValues,
    trainingMode:
      mode === 'edit' ? 'locked' : initialValues?.trainingMode ?? 'existing',
    targetAgeCategories: [...(initialValues?.targetAgeCategories ?? [])],
  }
}

export default function SessionForm({
  mode = 'create',
  initialValues = {},
  submitLabel = 'Create session',
  accessToken,
  onSubmit,
  cancelTo = '/manager',
}) {
  const [form, setForm] = useState(() => createInitialForm(initialValues, mode))
  const [trainingTypes, setTrainingTypes] = useState([])
  const [isTrainingTypesLoading, setIsTrainingTypesLoading] = useState(false)
  const [trainingTypesError, setTrainingTypesError] = useState('')
  const [instructors, setInstructors] = useState([])
  const [isInstructorsLoading, setIsInstructorsLoading] = useState(true)
  const [instructorsError, setInstructorsError] = useState(null)
  const [instructorsReloadKey, setInstructorsReloadKey] = useState(0)
  const [isAddInstructorOpen, setIsAddInstructorOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    if (!accessToken) {
      return undefined
    }

    let isActive = true

    async function loadTrainingTypes() {
      setIsTrainingTypesLoading(true)
      setTrainingTypesError('')

      try {
        const data = await getTrainingTypes(accessToken)

        if (isActive) {
          setTrainingTypes(data)
        }
      } catch (error) {
        if (isActive) {
          setTrainingTypesError(error.message)
        }
      } finally {
        if (isActive) {
          setIsTrainingTypesLoading(false)
        }
      }
    }

    loadTrainingTypes()

    return () => {
      isActive = false
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) {
      return undefined
    }

    let isActive = true

    async function loadInstructors() {
      setIsInstructorsLoading(true)
      setInstructorsError(null)

      try {
        const data = await getInstructors(accessToken)

        if (isActive) {
          setInstructors(data)
        }
      } catch (error) {
        if (isActive) {
          setInstructors([])
          setInstructorsError({
            message: error.message,
            status: error.status ?? 0,
          })
        }
      } finally {
        if (isActive) {
          setIsInstructorsLoading(false)
        }
      }
    }

    loadInstructors()

    return () => {
      isActive = false
    }
  }, [accessToken, instructorsReloadKey])

  const selectedTraining = trainingTypes.find(
    (training) => training.id === form.trainingId
  )

  const trainingTypeOptions = [
    ...trainingTypes.map((training) => ({
      value: training.id,
      label: training.name,
    })),
    {
      value: NEW_TRAINING_OPTION,
      label: '+ Create a new training type',
    },
  ]

  const instructorOptions = instructors.map((instructor) => ({
    value: instructor.id,
    label: instructor.fullName || 'Instructor',
  }))

  const hasValidInstructor =
    Boolean(form.instructorId) &&
    instructors.some((instructor) => instructor.id === form.instructorId)

  async function handleCreateInstructor(payload) {
    return createInstructor(payload, accessToken)
  }

  function handleInstructorCreated(instructor) {
    setInstructors((current) => [
      ...current.filter((item) => item.id !== instructor.id),
      instructor,
    ])
    setInstructorsError(null)
    setForm((current) => ({
      ...current,
      instructorId: instructor.id,
    }))
    setInstructorsReloadKey((key) => key + 1)
    setIsAddInstructorOpen(false)
    setSubmitError('')
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setSubmitError('')
  }

  function handleTrainingChange(value) {
    setForm((current) => ({
      ...current,
      trainingId: value === NEW_TRAINING_OPTION ? '' : value,
      trainingMode: value === NEW_TRAINING_OPTION ? 'new' : 'existing',
    }))
    setSubmitError('')
  }

  function handleInstructorChange(value) {
    setForm((current) => ({
      ...current,
      instructorId: value,
    }))
    setSubmitError('')
  }

  function handleCategoryChange(event) {
    const { value, checked } = event.target

    setForm((current) => ({
      ...current,
      targetAgeCategories: checked
        ? [...current.targetAgeCategories, value]
        : current.targetAgeCategories.filter((category) => category !== value),
    }))
    setSubmitError('')
  }

  function validate() {
    if (!onSubmit) {
      return 'Submission is not connected.'
    }

    if (!String(form.title).trim()) {
      return 'Enter a session title.'
    }

    if (!String(form.description).trim()) {
      return 'Enter a session description.'
    }

    if (!form.date) {
      return 'Choose a session date.'
    }

    if (!form.time) {
      return 'Choose a start time.'
    }

    const duration = Number(form.durationMinutes)
    const capacity = Number(form.maxCapacity)

    if (!Number.isInteger(duration) || duration <= 0) {
      return 'Duration must be a whole number of minutes greater than zero.'
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      return 'Maximum participants must be a whole number greater than zero.'
    }

    if (!/^https?:\/\//i.test(String(form.zoomUrl).trim())) {
      return 'Enter a valid Zoom meeting URL (it must start with http:// or https://).'
    }

    if (form.targetAgeCategories.length === 0) {
      return 'Select at least one age category.'
    }

    if (isInstructorsLoading) {
      return 'Wait for the instructor list to finish loading.'
    }

    if (instructorsError) {
      return instructorsError.message
    }

    if (instructors.length === 0) {
      return 'No instructors available. A session cannot be saved until an instructor is available.'
    }

    if (!form.instructorId || !hasValidInstructor) {
      return 'Select an instructor.'
    }

    if (form.trainingMode === 'new') {
      if (!String(form.newTrainingCode).trim()) {
        return 'Enter a training code for the new training type.'
      }

      if (!String(form.newTrainingName).trim()) {
        return 'Enter a name for the new training type.'
      }
    } else if (form.trainingMode === 'existing' && !form.trainingId) {
      return 'Select a training type.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setSubmitError('')
    setSubmitSuccess('')

    const validationError = validate()

    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(form)
      setSubmitSuccess(
        mode === 'edit'
          ? 'Session updated successfully.'
          : 'Session created successfully.'
      )
    } catch (error) {
      setSubmitError(getSessionSaveErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className="session-form" onSubmit={handleSubmit}>
      <fieldset className="session-form__section" disabled={isSubmitting}>
        <legend>Training information</legend>

        <div className="session-form__grid">
          <div className="session-form__field">
            <label
              id="session-training-type-label"
              htmlFor="session-training-type"
            >
              Training type
            </label>

            {mode === 'edit' ? (
              <input
                id="session-training-type"
                value={
                  selectedTraining?.name ||
                  initialValues.trainingName ||
                  'Current training'
                }
                readOnly
              />
            ) : (
              <SearchableSelect
                id="session-training-type"
                ariaLabelledBy="session-training-type-label"
                value={
                  form.trainingMode === 'new'
                    ? NEW_TRAINING_OPTION
                    : form.trainingId
                }
                options={trainingTypeOptions}
                onChange={handleTrainingChange}
                placeholder={
                  isTrainingTypesLoading
                    ? 'Loading training types…'
                    : 'Search training types…'
                }
                disabled={
                  isTrainingTypesLoading || Boolean(trainingTypesError)
                }
              />
            )}
          </div>

          {isTrainingTypesLoading && <p>Loading training types…</p>}

          {trainingTypesError && <p role="alert">{trainingTypesError}</p>}

          {selectedTraining &&
            (mode === 'edit' || form.trainingMode === 'existing') && (
              <>
                <label className="session-form__field">
                  <span>Training code</span>
                  <input
                    value={selectedTraining.trainingCode || ''}
                    readOnly
                    aria-readonly="true"
                  />
                </label>

                <label className="session-form__field">
                  <span>Training name</span>
                  <input
                    value={selectedTraining.name || ''}
                    readOnly
                    aria-readonly="true"
                  />
                </label>

                <label className="session-form__field session-form__field--wide">
                  <span>New training description (optional)</span>
                  <input
                    value={selectedTraining.description || ''}
                    readOnly
                    aria-readonly="true"
                    maxLength={500}
                    placeholder={
                      selectedTraining.description
                        ? undefined
                        : 'No description is available for this training type.'
                    }
                  />
                </label>
              </>
            )}

          {form.trainingMode === 'new' && mode === 'create' && (
            <>
              <label className="session-form__field">
                <span>New training code</span>
                <input
                  name="newTrainingCode"
                  value={form.newTrainingCode}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. AI-INTRO-001"
                  required
                />
              </label>

              <label className="session-form__field">
                <span>New training name</span>
                <input
                  name="newTrainingName"
                  value={form.newTrainingName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. Introduction to Artificial Intelligence"
                  required
                />
              </label>

              <label className="session-form__field session-form__field--wide">
                <span>New training description (optional)</span>
                <input
                  name="newTrainingDescription"
                  value={form.newTrainingDescription}
                  onChange={handleChange}
                  maxLength={500}
                />
              </label>
            </>
          )}

          <label className="session-form__field">
            <span>Session title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </label>

          <div className="session-form__field session-form__field--wide">
            <label
              id="session-instructor-label"
              htmlFor="session-instructor"
            >
              Instructor
            </label>

            <SearchableSelect
              id="session-instructor"
              ariaLabelledBy="session-instructor-label"
              value={form.instructorId}
              options={instructorOptions}
              onChange={handleInstructorChange}
              placeholder={
                isInstructorsLoading
                  ? 'Loading instructors…'
                  : instructors.length === 0
                    ? 'No instructors available'
                    : 'Search instructors…'
              }
              disabled={
                isInstructorsLoading ||
                Boolean(instructorsError) ||
                instructors.length === 0
              }
            />

            <div className="session-form__instructor-meta">
              <button
                type="button"
                className="session-form__add-instructor"
                onClick={() => setIsAddInstructorOpen(true)}
              >
                + Add new instructor
              </button>

              <button
                type="button"
                className="session-form__refresh"
                onClick={() => setInstructorsReloadKey((key) => key + 1)}
                disabled={isInstructorsLoading}
              >
                {isInstructorsLoading
                  ? 'Refreshing…'
                  : 'Refresh instructors'}
              </button>

              {isInstructorsLoading && (
                <span className="session-form__hint">
                  Loading instructors…
                </span>
              )}
            </div>

            {instructorsError && (
              <p className="form-error" role="alert">
                {instructorsError.message}
                {instructorsError.status === 401 && (
                  <>
                    {' '}
                    <Link to="/login">Log in</Link>
                  </>
                )}
              </p>
            )}

            {!isInstructorsLoading &&
              !instructorsError &&
              instructors.length === 0 && (
                <p className="form-error">
                  No instructors available. Use “Add new instructor” to create
                  one before creating or editing a session.
                </p>
              )}

            {!isInstructorsLoading &&
              !instructorsError &&
              instructors.length > 0 &&
              form.instructorId &&
              !hasValidInstructor && (
                <p className="form-error">
                  The previously selected instructor is no longer available.
                  Please choose another instructor.
                </p>
              )}
          </div>

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

          <label className="session-form__field session-form__field--wide">
            <span>Prerequisites (optional)</span>
            <textarea
              name="prerequisites"
              value={form.prerequisites}
              onChange={handleChange}
              rows={3}
              maxLength={2000}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="session-form__section" disabled={isSubmitting}>
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

      <fieldset className="session-form__section" disabled={isSubmitting}>
        <legend>Target age categories</legend>

        <div className="session-form__categories">
          {getAgeCategoryLabels().map((category) => (
            <label className="session-form__category" key={category}>
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

      <fieldset className="session-form__section" disabled={isSubmitting}>
        <legend>Meeting access</legend>

        <label className="session-form__field">
          <span>Zoom meeting URL</span>
          <input
            name="zoomUrl"
            type="url"
            value={form.zoomUrl}
            onChange={handleChange}
            placeholder="https://…"
            maxLength={2000}
            required
          />
        </label>

        <p className="session-form__hint">
          The Zoom link is stored on the backend and is only revealed to
          registered participants when they join.
        </p>
      </fieldset>

      <div className="session-form__actions">
        <Link to={cancelTo}>Cancel</Link>

        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}

        {submitSuccess && (
          <p className="form-success" role="status">
            {submitSuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !onSubmit ||
            isInstructorsLoading ||
            Boolean(instructorsError) ||
            !hasValidInstructor
          }
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
      </form>

      {isAddInstructorOpen && (
        <div
          className="session-form__dialog-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsAddInstructorOpen(false)
            }
          }}
        >
          <div
            className="session-form__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-instructor-title"
          >
            <div className="session-form__dialog-heading">
              <h2 id="add-instructor-title">Add new instructor</h2>

              <button
                className="session-form__dialog-close"
                type="button"
                onClick={() => setIsAddInstructorOpen(false)}
                aria-label="Close instructor form"
              >
                ×
              </button>
            </div>

            <InstructorForm
              mode="create"
              onSubmit={handleCreateInstructor}
              onSaved={handleInstructorCreated}
              onCancel={() => setIsAddInstructorOpen(false)}
              compact
            />
          </div>
        </div>
      )}
    </>
  )
}
