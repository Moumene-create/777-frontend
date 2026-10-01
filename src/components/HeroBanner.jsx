import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    image:
        'https://media.licdn.com/dms/image/v2/D4D22AQHZ7w8oJOPUQQ/feedshare-image-high-res/B4DZ_1T8igJIAU-/0/1786527075550?e=1792627200&v=beta&t=WP67I7J7skMCpPdUCwOaojnTmNx9_WrZylgsnrxF8Xs',
    alt: 'People collaborating during a training session',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQG2jEwSCCLteA/feedshare-image-high-res/B4DZ_1UxX9J4AU-/0/1786527291668?e=1792627200&v=beta&t=cJz_PgStVQiH8eg1zpbk3jN9LVapnLjf5NTjUqJ2Fzs',
    alt: 'Students learning together',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQHer6Laud5UIg/feedshare-image-high-res/B4DaCKfAsiKsAU-/0/1789029780628?e=1792627200&v=beta&t=gbktTM1mrtBO5PxarXYP_JNO1ahhG4rTi--k1jNPXXU',
    alt: 'Person participating in online learning',
  },
   {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQFbXacMgkp8DA/feedshare-image-high-res/B4DaCKfAqQGkAU-/0/1789029780450?e=1792627200&v=beta&t=nbQMWuobMrckL7QWxgRQT0CFNdQ8YcD2_PDfJVK17gc',
    alt: 'Person participating in online learning',
  },
   {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQGEA87T9AJ4dw/feedshare-image-high-res/B4DaCKfAmFKQAU-/0/1789029780320?e=1792627200&v=beta&t=uVRrE1Nfv3Udii8QudGfmxBoCpfLG4k1BYTbTmk5Vo4',
    alt: 'Person participating in online learning',
  },
   {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQExQFoVipHtHA/feedshare-image-high-res/B4DaAPXD9SHQAY-/0/1786964099676?e=1792627200&v=beta&t=kVzFrOFAFbe-VDYDxqXOg1sSt0VHApr8eH4kScNDmYs',
    alt: 'Person participating in online learning',
  },
   {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQGqmqyHQLVNrw/feedshare-image-high-res/B4DaAPXDoyHgAU-/0/1786964098432?e=1792627200&v=beta&t=MzgRIxjphTYrz8i7iLSTLTrycDsHkWHwgIolajBvxnc',
    alt: 'Person participating in online learning',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQEiduJT5U0B_w/feedshare-image-high-res/B4DaAPXAoaJgAU-/0/1786964085977?e=1792627200&v=beta&t=G8cBxcP9ntSyPS7WSVVY2TEtW_manZE1caaElLirVXg',
    alt: 'Person participating in online learning',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQEUS7WVH6sNpg/feedshare-image-high-res/B4DaAPXGOZJUAU-/0/1786964108854?e=1792627200&v=beta&t=zb2r6YCNHX6BtCHSeanto4a36QDL_foBSEEGL6LZRrE',
    alt: 'Person participating in online learning',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQGdE-XyifsaaQ/feedshare-image-high-res/B4DaAPXGUTGwAU-/0/1786964109623?e=1792627200&v=beta&t=EXc2U4cb-mn2X9N6qQxK7Ne1gfMAO8NezqEJvfddICo',
    alt: 'Person participating in online learning',
  },
  {
    image:
      'https://media.licdn.com/dms/image/v2/D4D22AQH-p968ZlpwuQ/feedshare-image-high-res/B4DaAPXGqxGkAU-/0/1786964110740?e=1792627200&v=beta&t=r6fzYZml0NOkrMsd2V3dexIi0lO6xovRc8l0cnlHNVs',
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
    <section className="hero-banner">
      <img
        className="hero-banner__image"
        src={currentSlide.image}
        alt={currentSlide.alt}
      />

      <div className="hero-banner__overlay" />

      <div className="hero-banner__content">

        <h1>Digital skills for every generation.</h1>

        <p className="hero-banner__description">
          From 7 to 77, empowered by digital.
        </p>

        <Link className="hero-banner__button" to="/login">
          View programmes
        </Link>
      </div>
    </section>
  )
}

export default HeroBanner