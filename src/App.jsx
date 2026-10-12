import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import { mockSessions } from './data/mockSessions'

function App() {
  const [registeredSessionIds, setRegisteredSessionIds] = useState([])
  const [sessions, setSessions] = useState(mockSessions)

function handleRegister(sessionId) {
  const isAlreadyRegistered = registeredSessionIds.includes(sessionId)

  if (isAlreadyRegistered) {
    return
  }

  setRegisteredSessionIds((currentIds) => [...currentIds, sessionId])

  setSessions((currentSessions) =>
    currentSessions.map((session) =>
      session.id === sessionId &&
      session.registeredCount < session.maxCapacity
        ? { ...session, registeredCount: session.registeredCount + 1 }
        : session
    )
  )
}

function handleUnregister(sessionId) {
  const isRegistered = registeredSessionIds.includes(sessionId)

  if (!isRegistered) {
    return
  }

  setRegisteredSessionIds((currentIds) =>
    currentIds.filter((id) => id !== sessionId)
  )

  setSessions((currentSessions) =>
    currentSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            registeredCount: Math.max(0, session.registeredCount - 1),
          }
        : session
    )
  )
}

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/sessions"
        element={
          <SessionsPage
            sessions={sessions}
            registeredSessionIds={registeredSessionIds}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
          />
        }
      />
      <Route
        path="/sessions/:sessionId"
        element={
          <SessionDetailsPage
            sessions={sessions}
            registeredSessionIds={registeredSessionIds}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
          />
        }
      />
    </Routes>
  )
}

export default App