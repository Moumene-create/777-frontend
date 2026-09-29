import PublicHeader from "../components/PublicHeader"
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <>
        <PublicHeader />

        <main>
            <section>
                <p>Algérie Télécom</p>

                <h1>Learn, connect, and grow with 7.77.</h1>

                <p>
                    Discover online training sessions designed for particpants aged 7 to 77
                </p>
                <Link to="/signup">Get started</Link>
            </section>
        </main>
    </>
  )
}

export default HomePage