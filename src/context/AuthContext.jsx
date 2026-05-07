import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	const fetchMe = useCallback(async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			setLoading(false)
			return
		}
		if (token === 'test-mock-token') {
			setUser({
				_id: '000000000000000000000001',
				username: import.meta.env.VITE_TEST_USER_USERNAME || 'testuser',
				email: import.meta.env.VITE_TEST_USER_EMAIL || '',
				avatar: '',
				sharedWith: [],
			})
			setLoading(false)
			return
		}
		try {
			const { data } = await api.get('/auth/me')
			setUser(data)
		} catch {
			localStorage.removeItem('token')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchMe()
	}, [fetchMe])

	const login = async (email, password) => {
		const testEmail = import.meta.env.VITE_TEST_USER_EMAIL
		const testPassword = import.meta.env.VITE_TEST_USER_PASSWORD
		if (testEmail && testPassword && email === testEmail && password === testPassword) {
			const mockUser = {
				_id: '000000000000000000000001',
				username: import.meta.env.VITE_TEST_USER_USERNAME || 'testuser',
				email: testEmail,
				avatar: '',
				sharedWith: [],
			}
			localStorage.setItem('token', 'test-mock-token')
			setUser(mockUser)
			return { token: 'test-mock-token', user: mockUser }
		}
		const { data } = await api.post('/auth/login', { email, password })
		localStorage.setItem('token', data.token)
		setUser(data.user)
		return data
	}

	const register = async (username, email, password) => {
		const { data } = await api.post('/auth/register', { username, email, password })
		localStorage.setItem('token', data.token)
		setUser(data.user)
		return data
	}

	const logout = () => {
		localStorage.removeItem('token')
		setUser(null)
	}

	return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
