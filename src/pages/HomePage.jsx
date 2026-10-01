import PublicHeader from '../components/PublicHeader'
import HeroBanner from '../components/HeroBanner'

function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="home-page">
        <HeroBanner />

        <section className="page-content">
          <h2>Explore our training programmes</h2>

          <p>
            Online learning opportunities for participants aged 7 to 77.
          </p>
        </section>
      </main>
    </>
  )
}

export default HomePage