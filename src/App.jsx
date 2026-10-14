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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
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
function handleLogin(userData) {
  setIsAuthenticated(true)
  setCurrentUser(userData)
}

function handleLogout() {
  setIsAuthenticated(false)
  setCurrentUser(null)
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
      <Route 
      path="/" 
      element={<HomePage 
      onLogin={handleLogin}
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      onLogout={handleLogout}
      />} />
      <Route
        path="/login"
        element={<LoginPage
        onLogin={handleLogin}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />}
      />
      <Route 
        path="/signup" 
        element={<SignUpPage
        onLogin={handleLogin}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />} />
      <Route
        path="/sessions"
        element={
          <SessionsPage
            sessions={sessions}
            registeredSessionIds={registeredSessionIds}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
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