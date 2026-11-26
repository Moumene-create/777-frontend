import { useEffect, useRef, useState } from 'react'
import { uploadInstructorPhoto } from '../api/instructors'
import {
  INSTRUCTOR_PHOTO_MAX_BYTES,
  INSTRUCTOR_PHOTO_TYPES,
  validateInstructorPhoto,
} from '../utils/instructor'
import './InstructorPhotoUploader.css'

function initialsOf(instructor) {
  return `${instructor.firstName?.[0] ?? ''}${
    instructor.lastName?.[0] ?? ''
  }`.toUpperCase()
}

export default function InstructorPhotoUploader({
  accessToken,
  instructor,
  onUploaded,
}) {
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setPreviewUrl('')
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null
    setError('')
    setSuccess('')
    clearPreview()

    if (!file) {
      setSelectedFile(null)
      return
    }

    const validationError = validateInstructorPhoto(file)

    if (validationError) {
      setSelectedFile(null)
      setError(validationError)
      event.target.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setSelectedFile(file)
    setPreviewUrl(objectUrl)
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) {
      return
    }

    const validationError = validateInstructorPhoto(selectedFile)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSuccess('')
    setIsUploading(true)

    try {
      const updated = await uploadInstructorPhoto(
        instructor.id,
        selectedFile,
        accessToken
      )

      onUploaded(updated)
      setSelectedFile(null)
      clearPreview()
      setSuccess('Photo updated.')
      setError('')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  const displayedPhoto = previewUrl || instructor.photoSrc

  return (
    <section className="instructor-photo" aria-labelledby="instructor-photo-title">
      <h2 id="instructor-photo-title">Instructor photo</h2>

      <div className="instructor-photo__preview">
        {displayedPhoto ? (
          <img
            src={displayedPhoto}
            alt={
              previewUrl
                ? 'Selected instructor photo preview'
                : `Photo of ${instructor.fullName}`
            }
          />
        ) : (
          <span className="instructor-photo__placeholder" aria-hidden="true">
            {initialsOf(instructor) || 'IN'}
          </span>
        )}
      </div>

      <div className="instructor-photo__controls">
        <label className="instructor-photo__picker">
          <span>{instructor.photoSrc ? 'Replace photo' : 'Choose photo'}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={INSTRUCTOR_PHOTO_TYPES.join(',')}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {selectedFile && (
          <button
            className="instructor-photo__upload"
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading…' : 'Upload photo'}
          </button>
        )}
      </div>

      <p className="instructor-photo__hint">
        JPEG, PNG or WebP. Maximum {INSTRUCTOR_PHOTO_MAX_BYTES / (1024 * 1024)} MB.
        The file is stored by the backend; featured instructors need a photo to
        appear on the public homepage.
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="form-success" role="status">
          {success}
        </p>
      )}
    </section>
  )
}
