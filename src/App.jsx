import { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/loginPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailsPage from './pages/SessionDetailsPage'
import { mockSessions } from './data/mockSessions'
import { isBeforeRegistrationCutoff } from './utils/sessionStatus';
import MySessionsPage from './pages/MySessionsPage'
import ProfilePage from './pages/ProfilePage'
import { calculateAgeCategory } from './utils/ageCategory'
import { isWithinJoinWindow } from './utils/sessionStatus'
import ManagerSessionsPage from './pages/ManagerSessionsPage'
import CreateSessionPage from './pages/CreateSessionPage'
import EditSessionPage from './pages/EditSessionPage'

const testSession = {
  startDateTime: '2026-11-04T14:00:00+01:00',
  durationMinutes: 60,
}

console.table([
  {
    case: 'Before access opens',
    result: isWithinJoinWindow(
      testSession,
      new Date('2026-11-04T12:59:59+01:00')
    ),
    expected: false,
  },
  {
    case: 'Exactly when access opens',
    result: isWithinJoinWindow(
      testSession,
      new Date('2026-11-04T13:00:00+01:00')
    ),
    expected: true,
  },
  {
    case: 'During the session',
    result: isWithinJoinWindow(
      testSession,
      new Date('2026-11-04T14:30:00+01:00')
    ),
    expected: true,
  },
  {
    case: 'Exactly at session end',
    result: isWithinJoinWindow(
      testSession,
      new Date('2026-11-04T15:00:00+01:00')
    ),
    expected: false,
  },
])


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

}
function handleLogin(userData) {
  setIsAuthenticated(true)
  setCurrentUser(userData)
}
function handleLogout() {
  setIsAuthenticated(false)
  setCurrentUser(null)
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
      {import.meta.env.DEV && (
      <Route
        path="/manager/sessions"
        element={
          isAuthenticated ? (
            <ManagerSessionsPage
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
        path="/manager/sessions/new"
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
        path="/manager/sessions/:sessionId/edit"
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
        path="/manager/sessions/:sessionId/edit"
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
    </Routes>
  )
}

export default App