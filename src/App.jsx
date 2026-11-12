import { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import MySessionsPage from './pages/MySessionsPage'
import ProfilePage from './pages/ProfilePage'
import ManagerSessionsPage from './pages/ManagerSessionsPage'
import CreateSessionPage from './pages/CreateSessionPage'
import EditSessionPage from './pages/EditSessionPage'
import AttendanceValidationPage from './pages/AttendanceValidationPage'
import RequireManager from './components/RequireManager'
import { getSessions, registerForSession, unregisterFromSession,getMySessions,cancelSession, } from './api/sessions'
import { getCurrentUser, updateCurrentUser, toProfileUpdatePayload, normalizeUserInfo} from './api/auth'

function App() {
  // IDs of sessions the logged-in user is registered for. to be modified in useEffect.
  const [registeredSessionIds, setRegisteredSessionIds] = useState([])
  // The logged-in user
  const [currentUser, setCurrentUser] = useState(null)
  // Pauses the app while it checks whether that key still works.
  const [isUserLoading, setIsUserLoading] = useState(() => Boolean(sessionStorage.getItem('accessToken')))
  // acces token Remembers that you were logged in. It’s the saved key that survives the refresh.
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'))
  // Authorization check
  const isAuthenticated = Boolean(currentUser)
  // the list of all sessions from the backend ( for now only the sessions from the same )
  const [sessions, setSessions] = useState([])
  // gets the sessions registered by the user 
  useEffect(() => {
    if (!accessToken) {
      setRegisteredSessionIds([])
      return
    }
    let isActive = true
    async function loadRegisteredSessionIds() {
      try {
        const mySessions = await getMySessions(accessToken)
        if (!isActive) {
          return
        }
        const activeRegistrationIds = mySessions
          .filter((session) => session.registration_state === 'registered')
          .map((session) => session.id)

        setRegisteredSessionIds(activeRegistrationIds)
      } catch (error) {
        console.error(
          'Could not load your registered sessions:',
          error.message
        )
      }
    }
    loadRegisteredSessionIds()
    return () => {
      isActive = false
    }
  }, [accessToken])
  // save the token to sessionStorage
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

  useEffect(() => {
    if (!accessToken) {
      setIsUserLoading(false)
      return
    }

    let isActive = true

    async function loadCurrentUser() {
      try {
        const backendUser = await getCurrentUser(accessToken)

        if (isActive) {
          setCurrentUser(normalizeUserInfo(backendUser))
        }
      } catch (error) {
        console.error('Could not load the current user:', error.message)
      } finally {
        if (isActive) {
          setIsUserLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      isActive = false
    }
  }, [accessToken])

//////////////
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
  setCurrentUser(normalizeUserInfo(userData))
  setAccessToken(token)
}

function handleLogout() {
  setCurrentUser(null)
  setAccessToken(null)
}

async function handleUpdateProfile(updatedData) {
  const payload = toProfileUpdatePayload(updatedData)
  const savedUser = await updateCurrentUser(payload, accessToken)
  const normalizedUser = normalizeUserInfo(savedUser)

 setCurrentUser({
  ...normalizedUser,
  fullName: `${normalizedUser.firstName} ${normalizedUser.lastName}`.trim(),
})}

if (isUserLoading) {
  return (
    <main className="app-loading">
      <p>Loading your account…</p>
    </main>
  )
}
async function handleCancelSession(sessionId) {
  if (!accessToken) {
    throw new Error('Please log in again to cancel this session.')
  }

  await cancelSession(sessionId, accessToken)

  setSessions((currentSessions) =>
    currentSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            isCancelled: true,
            status: 'CANCELLED',
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
          registeredSessionIds={registeredSessionIds}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={handleLogout}
          accessToken={accessToken}
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
              accessToken={accessToken}
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
              onCancelSession={handleCancelSession}
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
              accessToken={accessToken}
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
              accessToken={accessToken}
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