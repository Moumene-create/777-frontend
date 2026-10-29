import { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import { mockSessions } from './data/mockSessions'
import { isBeforeRegistrationCutoff } from './utils/sessionStatus';

function App() {
  const [registeredSessionIds, setRegisteredSessionIds] = useState(() => {
  const savedIds = localStorage.getItem('registeredSessionIds')

  return savedIds ? JSON.parse(savedIds) : []
})
  const [sessions] = useState(mockSessions)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser')

    return savedUser ? JSON.parse(savedUser) : null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('currentUser') !== null
  )
  useEffect(() => {
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
  } else {
    localStorage.removeItem('currentUser')
  }
}, [currentUser])
useEffect(() => {
  localStorage.setItem(
    'registeredSessionIds',
    JSON.stringify(registeredSessionIds)
  )
}, [registeredSessionIds])
const sessionsWithLiveCounts = sessions.map((session) => {
  const isCurrentlyRegistered = registeredSessionIds.includes(session.id)

  return {
    ...session,
    registeredCount: isCurrentlyRegistered
      ? session.registeredCount + 1
      : session.registeredCount,
  }
})
function handleUnregister(sessionId) {
  if (!isAuthenticated) return;
  if (!registeredSessionIds.includes(sessionId)) return;

  setRegisteredSessionIds((currentIds) =>
    currentIds.filter((id) => id !== sessionId)
  );
}

function handleRegister(sessionId) {
  const session = sessions.find((item) => item.id === sessionId);

  if (!isAuthenticated || !session) return;

  if (!session.targetAgeCategories.includes(currentUser?.ageCategory)) {
    return;
  }

  if (registeredSessionIds.includes(sessionId)) return;
  if (session.registeredCount >= session.maxCapacity) return;
  if (!isBeforeRegistrationCutoff(session)) return;

    setRegisteredSessionIds((currentIds) => [
      ...currentIds,
      sessionId,
    ])

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
function handleLogin(userData) {
  setIsAuthenticated(true)
  setCurrentUser(userData)
}
function handleLogout() {
  setIsAuthenticated(false)
  setCurrentUser(null)
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
            sessions={sessionsWithLiveCounts}
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
            sessions={sessionsWithLiveCounts}
            registeredSessionIds={registeredSessionIds}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  )
}

export default App