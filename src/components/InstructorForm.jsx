import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildInstructorPayload,
  validateInstructorForm,
} from '../utils/instructor'
import './InstructorForm.css'

function toFormValues(initialValues = {}) {
  return {
    firstName: initialValues.firstName ?? '',
    lastName: initialValues.lastName ?? '',
    email: initialValues.email ?? '',
    phone: initialValues.phone ?? '',
    bio: initialValues.bio ?? '',
    isFeatured: Boolean(initialValues.isFeatured),
  }
}

export default function InstructorForm({
  mode = 'create',
  initialValues = {},
  onSubmit,
  onSaved,
  onCancel,
  cancelTo = '/manager/instructors',
  submitLabel,
  compact = false,
}) {
  const [form, setForm] = useState(() => toFormValues(initialValues))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || !onSubmit) {
      return
    }

    setSubmitError('')
    setSuccessMessage('')

    const validationErrors = validateInstructorForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const saved = await onSubmit(buildInstructorPayload(form))

      if (onSaved) {
        onSaved(saved)
      } else {
        setSuccessMessage(
          mode === 'edit'
            ? 'Instructor updated successfully.'
            : 'Instructor created successfully.'
        )
      }
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <form
      className={`instructor-form${compact ? ' instructor-form--compact' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="instructor-form__grid">
        <label className="instructor-form__field">
          <span>First name</span>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            maxLength={100}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={
              errors.firstName ? 'instructor-first-name-error' : undefined
            }
            required
          />
          {errors.firstName && (
            <span
              className="instructor-form__field-error"
              id="instructor-first-name-error"
            >
              {errors.firstName}
            </span>
          )}
        </label>

        <label className="instructor-form__field">
          <span>Last name</span>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            maxLength={100}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={
              errors.lastName ? 'instructor-last-name-error' : undefined
            }
            required
          />
          {errors.lastName && (
            <span
              className="instructor-form__field-error"
              id="instructor-last-name-error"
            >
              {errors.lastName}
            </span>
          )}
        </label>

        <label className="instructor-form__field">
          <span>Email (optional)</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'instructor-email-error' : undefined}
          />
          {errors.email && (
            <span
              className="instructor-form__field-error"
              id="instructor-email-error"
            >
              {errors.email}
            </span>
          )}
        </label>

        <label className="instructor-form__field">
          <span>Phone (optional)</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            maxLength={30}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'instructor-phone-error' : undefined}
          />
          {errors.phone && (
            <span
              className="instructor-form__field-error"
              id="instructor-phone-error"
            >
              {errors.phone}
            </span>
          )}
        </label>

        <label className="instructor-form__field instructor-form__field--wide">
          <span>Bio (optional)</span>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={5}
            maxLength={2000}
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? 'instructor-bio-error' : undefined}
          />
          {errors.bio && (
            <span
              className="instructor-form__field-error"
              id="instructor-bio-error"
            >
              {errors.bio}
            </span>
          )}
        </label>
      </div>

      <label className="instructor-form__featured">
        <input
          type="checkbox"
          name="isFeatured"
          checked={form.isFeatured}
          onChange={handleChange}
        />
        <span>
          Feature this instructor on the public homepage
          <small>Featured instructors also need a photo to appear publicly.</small>
        </span>
      </label>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      {successMessage && (
        <p className="form-success" role="status">
          {successMessage}
        </p>
      )}

      <div className="instructor-form__actions">
        {onCancel ? (
          <button
            className="instructor-form__cancel"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : (
          <Link className="instructor-form__cancel" to={cancelTo}>
            Cancel
          </Link>
        )}

        <button
          className="instructor-form__submit"
          type="submit"
          disabled={isSubmitting || !onSubmit}
        >
          {isSubmitting
            ? 'Saving…'
            : submitLabel ??
              (isEdit ? 'Save changes' : 'Create instructor')}
        </button>
      </div>
    </form>
  )
}
