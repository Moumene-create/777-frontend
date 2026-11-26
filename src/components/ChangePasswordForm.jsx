import { useState } from 'react'
import { changePassword } from '../api/auth'
import './ChangePasswordForm.css'

export default function ChangePasswordForm({ accessToken }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function resetForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('The new password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }

    if (newPassword === currentPassword) {
      setError('The new password must be different from the current one.')
      return
    }

    setIsSubmitting(true)

    try {
      await changePassword({ currentPassword, newPassword }, accessToken)
      resetForm()
      setSuccess('Your password has been updated.')
    } catch (requestError) {
      setError(requestError.message || 'Could not update your password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="change-password__form"
      onSubmit={handleSubmit}
      aria-label="Change password"
    >
      <label>
        <span>Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <label>
        <span>New password</span>
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <label>
        <span>Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      {error && (
        <p className="change-password__error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="change-password__success" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        className="change-password__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
