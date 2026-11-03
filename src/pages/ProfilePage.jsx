import PublicHeader from '../components/PublicHeader'
import ProfilePanel from '../components/ProfilePanel'
import './ProfilePage.css'
import { useState } from 'react'

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
}) {
  const [showCertificates, setShowCertificates] = useState(false)
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
        <section
  className="profile-activity"
  aria-labelledby="profile-activity-title"
>
  <div className="profile-activity__certificates">
  <h3 id="profile-activity-title">My certificates</h3>
  <p className="certificate-demo-note">
    Demo data : for interface testing only.
  </p>

  {demoCertificates.length === 0 ? (
    <p>No certificates available yet.</p>
  ) : (

  <ul className="certificate-list">
      {demoCertificates.map((certificate) => (
        <li
          className="certificate-list__item"
          key={certificate.id}
        >
          <div className="certificate-list__information">
            <h4>{certificate.sessionTitle}</h4>
            <p>Certificate · PDF</p>
          </div>

          <div className="certificate-list__actions">
            <a
              href={certificate.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PDF
            </a>

            <a
              href={certificate.pdfUrl}
              download
            >
              Download
            </a>
          </div>
        </li>
      ))}
  </ul>
  )}
</div>
</section>)}
      </div>
      
    </main>
    
  )
}