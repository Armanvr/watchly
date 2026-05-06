import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import CalendarPage from './pages/CalendarPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ShareAcceptPage from './pages/ShareAcceptPage'

const Protected = ({ children }) => {
	const { user, loading } = useAuth()
	if (loading)
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '100vh',
					color: 'var(--text-secondary)',
				}}
			>
				Chargement...
			</div>
		)
	return user ? children : <Navigate to='/login' replace />
}

const Guest = ({ children }) => {
	const { user, loading } = useAuth()
	if (loading) return null
	return user ? <Navigate to='/app' replace /> : children
}

export default function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/login'
					element={
						<Guest>
							<LoginPage />
						</Guest>
					}
				/>
				<Route
					path='/register'
					element={
						<Guest>
							<RegisterPage />
						</Guest>
					}
				/>
				<Route path='/share/:token' element={<ShareAcceptPage />} />
				<Route
					path='/app'
					element={
						<Protected>
							<CalendarPage />
						</Protected>
					}
				/>
				<Route
					path='/profile'
					element={
						<Protected>
							<ProfilePage />
						</Protected>
					}
				/>
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</AuthProvider>
	)
}
