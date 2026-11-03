import { useState } from 'react'
import FolderIllustration from './FolderIllustration'
import folderImage from '../assets/certificat.jpg'
import './ProfileOverview.css'

export default function ProfileOverview({
  currentUser,
  completedSessions = [],
  certificates = [],
  onEditProfile,
}) {
  const [showCertificates, setShowCertificates] = useState(false)
    
  const name = currentUser?.fullName || 'Participant'
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <section className="profile-overview" aria-label="Profil">
      <div className="profile-overview__banner" aria-hidden="true" />

      <header className="profile-overview__header">
        <div className="profile-overview__avatar" aria-hidden="true">
          {initial}
        </div>

        <div className="profile-overview__identity">
          <h1>{name}</h1>
          <p>{currentUser?.email}</p>

          <div className="profile-overview__badges">
            <span>Participant</span>
            {currentUser?.ageCategory && (
              <span>{currentUser.ageCategory}</span>
            )}
          </div>
        </div>

        <button
          className="profile-overview__edit"
          type="button"
          onClick={onEditProfile}
        >
          Edit the profile
        </button>
      </header>

      <section className="profile-overview__activity">
        <h2>Certificates</h2>

        <div className="profile-overview__activity-grid">
            
         <FolderIllustration
  documentImage={folderImage}
  label="Mes certificats"
  onOpenChange={setShowCertificates}
/>

          
        </div>
        {/* <div className="profile-overview__sessions">
            <h3>Completed sessions </h3>

            {completedSessions.length === 0 ? (
              <p>None completed for the moment.</p>
            ) : (
              <ul>
                {completedSessions.map((session) => (
                  <li key={session.id}>{session.title}</li>
                ))}
              </ul>
            )}
          </div> */}

        {showCertificates && (
        <section
            className="profile-overview__certificates"
            aria-label="Certificats disponibles"
        >
            <h3>Mes certificats</h3>

            {certificates.length === 0 ? (
            <p>Aucun certificat disponible pour le moment.</p>
            ) : (
            <ul>
                {certificates.map((certificate) => (
                <li key={certificate.id}>
                    <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    {certificate.sessionTitle} — Ouvrir le PDF
                    </a>
                </li>
                ))}
            </ul>
            )}
        </section>
        )}
      </section>
    </section>
  )
}