import { useEffect, useRef, useState } from 'react'
import PlatformIntro from './PlatformIntro'
import InstructorCarousel from './InstructorCarousel'
import './PlatformShowcase.css'

/**
 * Part 2 + 3 of the home page: the platform introduction on top and the
 * automatically scrolling instructor showcase below, filling one screen.
 * The two blocks fade in the first time the section enters the viewport.
 */
export default function PlatformShowcase() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current

    if (!section) {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      const timeoutId = window.setTimeout(() => setIsVisible(true), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`platform-showcase home-section${
        isVisible ? ' platform-showcase--visible' : ''
      }`}
      aria-labelledby="platform-intro-title"
    >
      <div className="platform-showcase__intro">
        <PlatformIntro />
      </div>

      <div className="platform-showcase__instructors">
        <InstructorCarousel />
      </div>
    </section>
  )
}
