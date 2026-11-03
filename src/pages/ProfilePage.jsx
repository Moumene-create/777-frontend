import PublicHeader from '../components/PublicHeader'
import ProfilePanel from '../components/ProfilePanel'
import './ProfilePage.css'

export default function ProfilePage({
  isAuthenticated,
  currentUser,
  onLogout,
  onUpdateProfile,
}) {
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
        />
      </div>
    </main>
  )
}