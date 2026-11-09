import { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import { isBeforeRegistrationCutoff } from './utils/sessionStatus';
import MySessionsPage from './pages/MySessionsPage'
import ProfilePage from './pages/ProfilePage'
import { calculateAgeCategory } from './utils/ageCategory'
import { isWithinJoinWindow } from './utils/sessionStatus'
import ManagerSessionsPage from './pages/ManagerSessionsPage'
import CreateSessionPage from './pages/CreateSessionPage'
import EditSessionPage from './pages/EditSessionPage'
import AttendanceValidationPage from './pages/AttendanceValidationPage'
import RequireManager from './components/RequireManager'
import { normalizeBackendUser } from './utils/user'
import { getSessions, registerForSession, unregisterFromSession } from './api/sessions'

function App() {
  // these 2 are made so that after refreshing the data remains 
  const [registeredSessionIds, setRegisteredSessionIds] = useState(() => {
  const savedIds = localStorage.getItem('registeredSessionIds')
  return savedIds ? JSON.parse(savedIds) : []})
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
 // sessionStorage is browser storage tied to the current browser tab. It is cleared when that tab closes.
 // it is not a variable that we created 
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'))

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('currentUser') !== null)

  const [sessions, setSessions] = useState([])
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

  useEffect(() => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken)
  } else {
    sessionStorage.removeItem('accessToken')
  }
  }, [accessToken])

  useEffect(() => {
  if (!accessToken) {
    return
  }

  let isActive = true

  async function loadSessions() {
    try {
      const sessions = await getSessions(accessToken)

      if (isActive) {
        setSessions(sessions)
      }
    } catch (error) {
      console.error('Could not load sessions:', error.message)
    }
  }

  loadSessions()

  return () => {
    isActive = false
  }
  }, [accessToken])

const sessionsWithLiveCounts = sessions


async function refreshSessions() {
  if (!accessToken) {
    return
  }

  try {
    const updatedSessions = await getSessions(accessToken)
    setSessions(updatedSessions)
  } catch (error) {
    console.error('Could not refresh sessions:', error.message)
  }
}

async function handleRegister(sessionId) {
  if (!isAuthenticated || !accessToken) {
    return
  }

  try {
    await registerForSession(sessionId, accessToken)

    setRegisteredSessionIds((currentIds) => [
      ...currentIds,
      sessionId,
    ])

    await refreshSessions()
  } catch (error) {
    console.error('Could not register:', error.message)
  }
}

async function handleUnregister(sessionId) {
  if (!isAuthenticated || !accessToken) {
    return
  }

  try {
    await unregisterFromSession(sessionId, accessToken)

    setRegisteredSessionIds((currentIds) =>
      currentIds.filter((id) => id !== sessionId)
    )

    await refreshSessions()
  } catch (error) {
    console.error('Could not cancel registration:', error.message)
  }
}

function handleLogin(userData, token) {
  setIsAuthenticated(true)
  setCurrentUser(userData)
  setAccessToken(token)
}
function handleLogout() {
  setIsAuthenticated(false)
  setCurrentUser(null)
  setAccessToken(null)
}
function handleUpdateProfile(updatedData) {
  const ageCategory = calculateAgeCategory(updatedData.dateOfBirth)

  setCurrentUser((currentUser) => ({
    ...currentUser,
    ...updatedData,
    fullName: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
    ageCategory,
  }))
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
      <Route
        path="/my-sessions"
        element={
          <MySessionsPage
            sessions={sessionsWithLiveCounts}
            registeredSessionIds={registeredSessionIds}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProfilePage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/manager"
        element={
          <RequireManager
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
          >
            <ManagerSessionsPage
              sessions={sessionsWithLiveCounts}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </RequireManager>
        }
      />
    {import.meta.env.DEV && (
      <Route
        path="/manager/new"
        element={
          isAuthenticated ? (
            <CreateSessionPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    )}
    {import.meta.env.DEV && (
      <Route
        path="/manager/:sessionId/edit"
        element={
          isAuthenticated ? (
            <EditSessionPage
              sessions={sessionsWithLiveCounts}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    )}
  {import.meta.env.DEV && (
    <Route
      path="/manager/:sessionId/attendance"
      element={
        isAuthenticated ? (
          <AttendanceValidationPage
            sessions={sessionsWithLiveCounts}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  )}

    </Routes>
  )
}

export default App