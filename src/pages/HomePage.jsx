import PublicHeader from '../components/PublicHeader'
import HeroBanner from '../components/HeroBanner'
import PlatformIntro from '../components/PlatformIntro'
import HowItWorks from '../components/HowItWorks'
import HomeCta from '../components/HomeCta'
import PublicFooter from '../components/PublicFooter'
import './HomePage.css'
function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="home-page">
        <HeroBanner />
        <PlatformIntro />
        <HowItWorks />
        <HomeCta />
        <PublicFooter />
      </main>
     
    </>
  )
}

export default HomePage