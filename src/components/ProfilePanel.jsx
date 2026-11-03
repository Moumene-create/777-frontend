import { useState } from 'react'
import './ProfilePanel.css'

function createDraft(user) {
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    wilaya: user?.wilaya || '',
  }
}

export default function ProfilePanel({ currentUser, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => createDraft(currentUser))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const profile = createDraft(currentUser)
  const displayName =
  [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
  currentUser?.fullName ||
  'Participant'
  const initials =
  [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0))
    .join('')
    .toUpperCase() ||
  displayName.charAt(0).toUpperCase()

  function startEditing() {
    setDraft(createDraft(currentUser))
    setError('')
    setMessage('')
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraft(createDraft(currentUser))
    setError('')
    setIsEditing(false)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setDraft((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const updatedProfile = {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        dateOfBirth: draft.dateOfBirth,
        wilaya: draft.wilaya.trim(),
    }

    if (Object.values(updatedProfile).some((value) => !value)) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    updatedProfile.fullName =
    `${updatedProfile.firstName} ${updatedProfile.lastName}`
    
    if (typeof onSave !== 'function') {
      setError('La sauvegarde du profil n’est pas encore connectée.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave(updatedProfile)
      setIsEditing(false)
      setMessage('Profile updated.')
    } catch (saveError) {
      setError(saveError.message || 'profile could not be updated.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="profile-panel" aria-label="Mon profil">
      

      <div
        className={`profile-panel__surface ${
          isEditing ? 'profile-panel__surface--editing' : ''
        }`}
      >
        <div className="profile-panel__toolbar">
        {!isEditing && (
          <button
            type="button"
            className="profile-panel__primary"
            onClick={startEditing}
          >
            Modifier le profil
          </button>
        )}
      </div>
        <div className="profile-panel__avatar" aria-hidden="true">
          {initials}
        </div>

        {isEditing ? (
          <form
            className="profile-panel__form"
            onSubmit={handleSubmit}
            aria-label="Modifier mes informations"
          >
            <h1>Modifier mon profil</h1>

            <fieldset disabled={isSaving}>
              <legend className="profile-panel__legend">
                Informations personnelles
              </legend>

              <div className="profile-panel__fields">
                <label className="profile-panel__field">
                <span>First name</span>
                <input
                    name="firstName"
                    value={draft.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    required
                />
                </label>

                <label className="profile-panel__field">
                <span>Last Name</span>
                <input
                    name="lastName"
                    value={draft.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    required
                />
                </label>

                <label className="profile-panel__field">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={draft.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="profile-panel__field">
                  <span>phone</span>
                  <input
                    name="phone"
                    type="tel"
                    value={draft.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </label>

                <label className="profile-panel__field">
                  <span>Date Of Birth</span>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={draft.dateOfBirth}
                    onChange={handleChange}
                    autoComplete="bday"
                    required
                  />
                </label>

                <label className="profile-panel__field">
                  <span>Wilaya</span>
                  <input
                    name="wilaya"
                    value={draft.wilaya}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              {error && <p role="alert">{error}</p>}

              <div className="profile-panel__actions">
                <button
                  type="button"
                  className="profile-panel__cancel"
                  onClick={cancelEditing}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="profile-panel__primary"
                >
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </fieldset>
          </form>
        ) : (
          <div className="profile-panel__information">
            <p className="profile-panel__role">Participant</p>
            <h1>{displayName}</h1>

            <dl className="profile-panel__details">
              <div>
                <dt>Email</dt>
                <dd>{profile.email || 'Non renseigné'}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>{profile.phone || 'Non renseigné'}</dd>
              </div>
              <div>
                <dt>Wilaya</dt>
                <dd>{profile.wilaya || 'Non renseignée'}</dd>
              </div>
              <div>
                <dt>Catégorie d’âge</dt>
                <dd>{currentUser?.ageCategory || 'Non renseignée'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {message && <p role="status">{message}</p>}
    </section>
  )
}