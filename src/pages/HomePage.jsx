import PublicHeader from '../components/PublicHeader'
import BaguiHero1 from '../components/BaguiHero1'
import PlatformShowcase from '../components/PlatformShowcase'
import HomeCta from '../components/HomeCta'
import PublicFooter from '../components/PublicFooter'
import './HomePage.css'

function HomePage({ isAuthenticated, currentUser, onLogout }) {
  return (
    <>
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
        overlay
      />

      <main className="home-page">
        <BaguiHero1 isAuthenticated={isAuthenticated} />

        <PlatformShowcase />

        <div className="home-section home-closing">
          <HomeCta
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
          />
          <PublicFooter />
        </div>
      </main>
    </>
  )
}

export default HomePage
