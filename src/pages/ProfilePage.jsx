import PublicHeader from '../components/PublicHeader'
import ProfilePanel from '../components/ProfilePanel'
import './ProfilePage.css'
import { useState } from 'react'


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
        <section
  className="profile-activity"
  aria-labelledby="profile-activity-title"
>
  


    <div
      className="profile-activity__certificates"
      hidden={!showCertificates}
    >
    
      <h3>Mes certificats</h3>
      <p>Aucun certificat disponible pour le moment.</p>
    </div>
 
</section>
      </div>
      
    </main>
    
  )
}