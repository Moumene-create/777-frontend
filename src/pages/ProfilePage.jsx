import PublicHeader from '../components/PublicHeader'
import ProfilePanel from '../components/ProfilePanel'
import './ProfilePage.css'
import { useEffect, useState } from 'react'
import {
  getCertificates,
  getCertificatePdf,
} from '../api/certificates'

const demoCertificates = [
  {
    id: 'demo-certificate',
    sessionTitle: 'Introduction to Artificial Intelligence',
    pdfUrl: `${import.meta.env.BASE_URL}certificates/demo-certificate.pdf`,
  },
]
export default function ProfilePage({
  isAuthenticated,
  currentUser,
  onLogout,
  onUpdateProfile,
  accessToken,
}) {
  const [showCertificates, setShowCertificates] = useState(false)
  const [certificates, setCertificates] = useState([])
  const [isCertificatesLoading, setIsCertificatesLoading] = useState(false)
  const [certificatesError, setCertificatesError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    if (!showCertificates || !accessToken) return

    let isActive = true

    async function loadCertificates() {
      setIsCertificatesLoading(true)
      setCertificatesError('')
      setCertificates([])

      try {
        const data = await getCertificates(accessToken)

        if (isActive) {
          setCertificates(data)
        }
      } catch (error) {
        if (isActive) {
          setCertificatesError(error.message)
        }
      } finally {
        if (isActive) {
          setIsCertificatesLoading(false)
        }
      }
    }

    loadCertificates()

    return () => {
      isActive = false
    }
  }, [showCertificates, accessToken])

  async function handleDownloadCertificate(certificate) {
    if (downloadingId) return

    setDownloadingId(certificate.registrationId)
    setDownloadError('')

    try {
      const pdf = await getCertificatePdf(
        certificate.registrationId,
        accessToken
      )

      const url = URL.createObjectURL(pdf)
      const link = document.createElement('a')

      link.href = url
      link.download = `certificate-${certificate.registrationId}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      setDownloadError(error.message)
    } finally {
      setDownloadingId(null)
    }
}
  return (
    <main className="profile-layout">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="profile-page">
        <ProfilePanel
          currentUser={currentUser}
          onSave={onUpdateProfile}
          onCertificatesOpenChange={setShowCertificates}
        />
        {showCertificates && (
          <section>
            <h2>My certificates</h2>
            {downloadError && <p role="alert">{downloadError}</p>}
            {!accessToken ? (
              <p>Please log in to view certificates.</p>
            ) : isCertificatesLoading ? (
              <p>Loading certificates...</p>
            ) : certificatesError ? (
              <p role="alert">{certificatesError}</p>
            ) : certificates.length === 0 ? (
              <p>No certificates available yet.</p>
            ) : (
              <ul>
                {certificates.map((certificate) => (
                  <li key={certificate.certificateId}>
                    <h3>{certificate.sessionTitle}</h3>
                    <p>
                      {certificate.participantFirstName}{' '}
                      {certificate.participantLastName}
                    </p>
                    <p>Session date: {certificate.sessionDate}</p>
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(certificate)}
                      disabled={downloadingId !== null}
                    >
                      {downloadingId === certificate.registrationId
                        ? 'Downloading...'
                        : 'Download PDF'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
      
    </main>
    
  )
}