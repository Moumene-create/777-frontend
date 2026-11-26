import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoMinistry from '../assets/logo-ministry-white.png'
import logoAT from '../assets/logo_AT_white.png'
import image_1 from "../assets/image_1.jpg"
import image_2 from "../assets/image_2.jpg"
import image_3 from "../assets/image_3.jpg"
import image_4 from "../assets/image_4.jpg"
import image_5 from "../assets/image_5.jpg"
import image_6 from "../assets/image_6.jpg"
import image_7 from "../assets/image_7.jpg"
import image_8 from "../assets/image_8.jpg"
import image_9 from "../assets/image_9.jpg"
import image_10 from "../assets/image_10.jpg"


import './HeroBanner.css'
const slides = [
  {
    image:
        image_1,
    alt: 'People collaborating during a training session',
  },

  {
    image:image_2,
    alt: 'Person participating in online learning',
  },
   {
    image:image_3,
    alt: 'Person participating in online learning',
  },
   {
    image:image_4,
    alt: 'Person participating in online learning',
  },
   {
    image:image_5,
    alt: 'Person participating in online learning',
  },
   {
    image:image_6,
    alt: 'Person participating in online learning',
  },
  {
    image:image_7,
    alt: 'Person participating in online learning',
  },
  {
    image:image_8,
    alt: 'Person participating in online learning',
  },
  {
    image:image_9,
    alt: 'Person participating in online learning',
  },
  {
    image:image_10,
    alt: 'Person participating in online learning',
  },
]

function HeroBanner() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

useEffect(() => {
  const slideInterval = setInterval(() => {
    setCurrentSlideIndex((currentIndex) => {
      return (currentIndex + 1) % slides.length
    })
  }, 5000)

  return () => {
    clearInterval(slideInterval)
  }
}, [])

const currentSlide = slides[currentSlideIndex]

  return (
    <section className="hero-banner home-section">
      <img
        className="hero-banner__image"
        src={currentSlide.image}
        alt={currentSlide.alt}
      />

      <div className="hero-banner__overlay" />

      <div className="hero-banner__content">
        <h1>Digital skills for every generation</h1>

        <p className="hero-banner__description">
          From 7 to 77, empowered by digital.
        </p>

        <Link className="hero-banner__button" to="/sessions">
          Join the programmes
        </Link>

        <div className="hero-banner__partner-logos">
          <div className="hero-banner__powered">
            <span className="hero-banner__powered-label">Powered by</span>
            <img
              className="hero-banner__powered-logo"
              src={logoAT}
              alt="Algérie Télécom"
            />
          </div>

          <img
            className="hero-banner__partner-logo"
            src={logoMinistry}
            alt="Ministry of Post and Telecommunications"
          />
        </div>

        
      </div>
    
        
    </section>
  )
}

export default HeroBanner