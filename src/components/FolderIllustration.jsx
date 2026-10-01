import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const documents = [
  { id: 1, offsetX: 42, offsetY: -30, rotation: 12 },
  { id: 2, offsetX: 3, offsetY: -38, rotation: 1 },
  { id: 3, offsetX: -40, offsetY: -32, rotation: -8 },
]

function FolderIllustration() {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleToggle = () => {
    setIsOpen((currentValue) => !currentValue)
  }

  return (
    <button
      type="button"
      className="folder-illustration"
      onClick={handleToggle}
      aria-pressed={isOpen}
      aria-label={isOpen ? 'Close training documents folder' : 'Open training documents folder'}
    >
      <span className="folder-illustration__scene" aria-hidden="true">
        <span className="folder-illustration__back" />

        <span className="folder-illustration__documents">
          {documents.map((document) => (
            <motion.span
              key={document.id}
              className="folder-illustration__document"
              animate={{
                x: shouldReduceMotion ? 0 : isOpen ? document.offsetX * 1: document.offsetX,
                y: shouldReduceMotion ? 0 : isOpen ? document.offsetY * 1.7 : document.offsetY,
                rotate: shouldReduceMotion ? 0 : isOpen ? document.rotation * 1.4 : document.rotation,
              }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 14,
              }}
            >
              <span className="folder-illustration__document-title" />
              <span className="folder-illustration__document-line" />
              <span className="folder-illustration__document-line" />
              <span className="folder-illustration__document-line" />
            </motion.span>
          ))}
        </span>

        <motion.span
          className="folder-illustration__flap"
          animate={{
            rotateX: shouldReduceMotion ? 0 : isOpen ? -55 : -15,
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 14,
          }}
        />
      </span>

      <span className="folder-illustration__label">
        {isOpen ? 'Training documents open' : 'View training documents'}
      </span>
    </button>
  )
}

export default FolderIllustration