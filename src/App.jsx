import { useLayoutEffect, useMemo, useState, useEffect, useCallback } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import MySessionsPage from './pages/MySessionsPage'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ManagerSessionsPage from './pages/ManagerSessionsPage'
import CreateSessionPage from './pages/CreateSessionPage'
import EditSessionPage from './pages/EditSessionPage'
import InstructorDirectoryPage from './pages/InstructorDirectoryPage'
import CreateInstructorPage from './pages/CreateInstructorPage'
import InstructorDetailPage from './pages/InstructorDetailPage'
import AttendanceValidationPage from './pages/AttendanceValidationPage'
import NotFoundPage from './pages/NotFoundPage'
import RequireAuth from './components/RequireAuth'
import RequireParticipant from './components/RequireParticipant'
import RequireManager from './components/RequireManager'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CheckEmailPage from './pages/CheckEmailPage'
import {
  cancelSession,
  createSession,
  getManagedSessions,
  getMySessions,
  getSessions,
  joinSession,
  registerForSession,
  unregisterFromSession,
  updateSession,
} from './api/sessions'
import {
  getCurrentUser,
  logout,
  normalizeUserInfo,
  refreshAuthTokens,
  toProfileUpdatePayload,
  updateCurrentUser,
} from './api/auth'
import { ApiError } from './api/errors'
import { createAuthenticatedFetch } from './api/authenticatedFetch'
import { configureApiClient } from './api/apiClient'
import { isActiveRegistration } from './utils/sessionStatus'

function readStoredToken(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStoredToken(key, value) {
  try {
    if (value) {
      sessionStorage.setItem(key, value)
    } else {
      sessionStorage.removeItem(key)
    }
  } catch {
    // Storage can be unavailable (private mode); the in-memory session still works.
  }
}

/**
 * Holds the mutable auth session outside React state so the shared fetch
 * client always reads the latest tokens without re-creating itself.
 */
function createAuthStore(initial = {}) {
  let state = {
    accessToken: initial.accessToken ?? null,
    refreshToken: initial.refreshToken ?? null,
    sessionId: 0,
  }

  return {
    getAccessToken: () => state.accessToken,
    getRefreshToken: () => state.refreshToken,
    getSessionId: () => state.sessionId,
    setTokens(accessToken, refreshToken) {
      state = { ...state, accessToken, refreshToken }
    },
    startSession(accessToken, refreshToken) {
      state = {
        accessToken,
        refreshToken,
        sessionId: state.sessionId + 1,
      }
    },
    reset() {
      state = {
        accessToken: null,
        refreshToken: null,
        sessionId: state.sessionId + 1,
      }
    },
  }
}

function App() {
  const [initialAccessToken] = useState(() => readStoredToken('accessToken'))
  const [initialRefreshToken] = useState(() => readStoredToken('refreshToken'))

  const [accessToken, setAccessToken] = useState(initialAccessToken)
  const [refreshToken, setRefreshToken] = useState(initialRefreshToken)
  const [authStore] = useState(() =>
    createAuthStore({
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
    })
  )

  const [currentUser, setCurrentUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(() =>
    initialAccessToken ? 'checking' : 'signed-out'
  )
  const [authError, setAuthError] = useState('')

  const [sessions, setSessions] = useState([])
  const [mySessions, setMySessions] = useState([])
  const [managedSessions, setManagedSessions] = useState([])
  const [dataError, setDataError] = useState('')

  const clearLocalSession = useCallback(() => {
    authStore.reset()
    writeStoredToken('accessToken', null)
    writeStoredToken('refreshToken', null)
    setCurrentUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setSessions([])
    setMySessions([])
    setManagedSessions([])
    setDataError('')
    setAuthStatus('signed-out')
    setAuthError('')
  }, [authStore])

  const [authenticatedRequest] = useState(() =>
    createAuthenticatedFetch({
      getAccessToken: () => authStore.getAccessToken(),
      getSessionId: () => authStore.getSessionId(),

      refreshSession: async () => {
        const sessionId = authStore.getSessionId()
        const storedRefreshToken = authStore.getRefreshToken()

        if (!storedRefreshToken) {
          clearLocalSession()
          throw new ApiError('Please log in again.', { status: 401 })
        }

        try {
          const tokens = await refreshAuthTokens(storedRefreshToken)

          if (authStore.getSessionId() !== sessionId) {
            throw new Error('The login session changed.')
          }

          authStore.setTokens(tokens.access_token, tokens.refresh_token)
          writeStoredToken('accessToken', tokens.access_token)
          writeStoredToken('refreshToken', tokens.refresh_token)

          setAccessToken(tokens.access_token)
          setRefreshToken(tokens.refresh_token)
        } catch (error) {
          if (error.status === 401 && authStore.getSessionId() === sessionId) {
            clearLocalSession()
          }

          throw error
        }
      },
    })
  )

  useLayoutEffect(() => {
    return configureApiClient(authenticatedRequest)
  }, [authenticatedRequest])

  useEffect(() => {
    writeStoredToken('accessToken', accessToken)
  }, [accessToken])

  useEffect(() => {
    writeStoredToken('refreshToken', refreshToken)
  }, [refreshToken])

  // Restore the backend user for a token left in sessionStorage.
  useEffect(() => {
    if (!accessToken || authStatus !== 'checking') {
      return undefined
    }

    let isActive = true

    async function restoreUser() {
      try {
        const backendUser = await getCurrentUser(
          accessToken,
          authenticatedRequest
        )

        if (!isActive) {
          return
        }

        setCurrentUser(normalizeUserInfo(backendUser))
        setAuthStatus('authenticated')
        setAuthError('')
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error.status === 401) {
          clearLocalSession()
          return
        }

        setAuthStatus('error')
        setAuthError(
          error.message || 'Could not restore your session. Please retry.'
        )
      }
    }

    restoreUser()

    return () => {
      isActive = false
    }
  }, [accessToken, authStatus, authenticatedRequest, clearLocalSession])

  const isAuthenticated = Boolean(currentUser)
  const isManager = currentUser?.role === 'SESSION_MANAGER'
  const currentUserId = currentUser?.id ?? null

  // Participant data: eligible sessions + the user's registrations.
  // Managers only use the management endpoints, so this is skipped for them.
  useEffect(() => {
    if (authStatus !== 'authenticated' || !accessToken || isManager) {
      return undefined
    }

    let isActive = true

    async function loadParticipantData() {
      try {
        const [sessionList, mySessionList] = await Promise.all([
          getSessions(accessToken),
          getMySessions(accessToken),
        ])

        if (!isActive) {
          return
        }

        setSessions(sessionList)
        setMySessions(mySessionList)
        setDataError('')
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error.status === 401) {
          clearLocalSession()
          return
        }

        setDataError(error.message)
      }
    }

    loadParticipantData()

    return () => {
      isActive = false
    }
  }, [authStatus, accessToken, currentUserId, isManager, clearLocalSession])

  // Manager data: the management endpoint is the only source that includes
  // target categories, instructor ids and non-eligible sessions.
  useEffect(() => {
    if (authStatus !== 'authenticated' || !accessToken || !isManager) {
      return undefined
    }

    let isActive = true

    async function loadManagedSessions() {
      try {
        const managed = await getManagedSessions(accessToken)

        if (isActive) {
          setManagedSessions(managed)
        }
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error.status === 401) {
          clearLocalSession()
          return
        }

        setDataError(error.message)
      }
    }

    loadManagedSessions()

    return () => {
      isActive = false
    }
  }, [authStatus, accessToken, isManager, clearLocalSession])

  const registeredSessionIds = useMemo(
    () =>
      mySessions
        .filter((session) => isActiveRegistration(session.registrationState))
        .map((session) => session.id),
    [mySessions]
  )

  async function refreshParticipantData() {
    if (!accessToken || isManager) {
      return
    }

    const [sessionList, mySessionList] = await Promise.all([
      getSessions(accessToken),
      getMySessions(accessToken),
    ])

    setSessions(sessionList)
    setMySessions(mySessionList)
  }

  async function refreshManagedSessions() {
    if (!accessToken || !isManager) {
      return
    }

    setManagedSessions(await getManagedSessions(accessToken))
  }

  async function handleRegister(sessionId) {
    if (!accessToken) {
      throw new ApiError('Please log in before registering.', { status: 401 })
    }

    await registerForSession(sessionId, accessToken)
    await refreshParticipantData()
  }

  async function handleUnregister(sessionId) {
    if (!accessToken) {
      throw new ApiError('Please log in before cancelling your registration.', {
        status: 401,
      })
    }

    await unregisterFromSession(sessionId, accessToken)
    await refreshParticipantData()
  }

  async function handleJoin(sessionId) {
    if (!accessToken) {
      throw new ApiError('Please log in before joining a session.', {
        status: 401,
      })
    }

    const zoomUrl = await joinSession(sessionId, accessToken)
    await refreshParticipantData()

    return zoomUrl
  }

  async function handleCancelSession(sessionId) {
    if (!accessToken) {
      throw new ApiError('Please log in again to cancel this session.', {
        status: 401,
      })
    }

    await cancelSession(sessionId, accessToken)
    await Promise.all([refreshManagedSessions(), refreshParticipantData()])
  }

  async function handleCreateSession(payload) {
    if (!accessToken) {
      throw new ApiError('Please log in again to create a session.', {
        status: 401,
      })
    }

    const created = await createSession(payload, accessToken)
    await Promise.all([refreshManagedSessions(), refreshParticipantData()])

    return created
  }

  async function handleUpdateSession(sessionId, payload) {
    if (!accessToken) {
      throw new ApiError('Please log in again to update this session.', {
        status: 401,
      })
    }

    const updated = await updateSession(sessionId, payload, accessToken)
    await Promise.all([refreshManagedSessions(), refreshParticipantData()])

    return updated
  }

  async function handleAttendanceValidated() {
    await refreshManagedSessions()
  }

  function handleLogin(userData, newAccessToken, newRefreshToken) {
    authStore.startSession(newAccessToken, newRefreshToken ?? null)
    setCurrentUser(normalizeUserInfo(userData))
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken ?? null)
    setAuthStatus('authenticated')
    setAuthError('')
  }

  async function handleLogout() {
    const tokenToRevoke = authStore.getAccessToken()

    clearLocalSession()

    try {
      if (tokenToRevoke) {
        await logout(tokenToRevoke)
      }
    } catch (error) {
      console.error('Could not revoke the session on the server:', error.message)
    }
  }

  async function handleUpdateProfile(updatedData) {
    const payload = toProfileUpdatePayload(updatedData)
    const savedUser = await updateCurrentUser(payload, accessToken)
    const normalizedUser = normalizeUserInfo(savedUser)

    setCurrentUser(normalizedUser)

    return normalizedUser
  }

  if (authStatus === 'checking') {
    return (
      <main className="app-loading">
        <p>Loading your account…</p>
      </main>
    )
  }

  if (authStatus === 'error') {
    return (
      <main className="app-loading">
        <h1>We could not restore your session</h1>
        <p role="alert">{authError}</p>
        <button
          type="button"
          onClick={() => {
            setAuthError('')
            setAuthStatus('checking')
          }}
        >
          Try again
        </button>
      </main>
    )
  }

  return (
    <>
      {isAuthenticated && dataError && (
        <p className="app-banner" role="alert">
          {dataError}
        </p>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route
          path="/signup"
          element={
            <SignUpPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/sessions"
          element={
            <RequireParticipant
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <SessionsPage
                sessions={sessions}
                registeredSessionIds={registeredSessionIds}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </RequireParticipant>
          }
        />
        <Route
          path="/sessions/:sessionId"
          element={
            <RequireParticipant
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <SessionDetailsPage
                registeredSessionIds={registeredSessionIds}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
                accessToken={accessToken}
              />
            </RequireParticipant>
          }
        />
        <Route
          path="/my-sessions"
          element={
            <RequireParticipant
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <MySessionsPage
                mySessions={mySessions}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
                onJoin={handleJoin}
              />
            </RequireParticipant>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <ProfilePage
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
                accessToken={accessToken}
              />
            </RequireAuth>
          }
        />

        <Route
          path="/profile/password"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <ChangePasswordPage
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
                accessToken={accessToken}
              />
            </RequireAuth>
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
                sessions={managedSessions}
                currentUser={currentUser}
                onLogout={handleLogout}
                onCancelSession={handleCancelSession}
              />
            </RequireManager>
          }
        />
        <Route
          path="/manager/instructors"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <InstructorDirectoryPage
                accessToken={accessToken}
                onLogout={handleLogout}
              />
            </RequireManager>
          }
        />
        <Route
          path="/manager/instructors/new"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <CreateInstructorPage
                accessToken={accessToken}
                onLogout={handleLogout}
              />
            </RequireManager>
          }
        />
        <Route
          path="/manager/instructors/:instructorId"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <InstructorDetailPage
                accessToken={accessToken}
                onLogout={handleLogout}
              />
            </RequireManager>
          }
        />

        <Route
          path="/manager/new"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <CreateSessionPage
                accessToken={accessToken}
                onLogout={handleLogout}
                onCreateSession={handleCreateSession}
              />
            </RequireManager>
          }
        />
        <Route
          path="/manager/:sessionId/edit"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <EditSessionPage
                accessToken={accessToken}
                onLogout={handleLogout}
                onUpdateSession={handleUpdateSession}
              />
            </RequireManager>
          }
        />
        <Route
          path="/manager/:sessionId/attendance"
          element={
            <RequireManager
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <AttendanceValidationPage
                accessToken={accessToken}
                onLogout={handleLogout}
                onAttendanceValidated={handleAttendanceValidated}
              />
            </RequireManager>
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </>
  )
}

export default App
