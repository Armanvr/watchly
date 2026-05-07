import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function LoginPage() {
	const { login } = useAuth()
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

	const submit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await login(form.email, form.password)
		} catch (err) {
			setError(err.response?.data?.message || 'Erreur de connexion')
		} finally {
			setLoading(false)
		}
	}

	const fillTest = () => {
		setForm({
			email: import.meta.env.VITE_TEST_USER_EMAIL || '',
			password: import.meta.env.VITE_TEST_USER_PASSWORD || '',
		})
	}

	return (
		<div className={styles.page}>
			<div className={styles.backdrop} />
			<div className={`${styles.card} scale-in`}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>▶</span>
					<span className={styles.logoText}>Watchly</span>
				</div>
				<h1 className={styles.title}>Connexion</h1>
				<p className={styles.sub}>Retrouvez votre calendrier de visionnage</p>
				{error && <div className={styles.error}>{error}</div>}
				<form onSubmit={submit} className={styles.form}>
					<div className={styles.field}>
						<label>Email</label>
						<input
							name='email'
							type='email'
							value={form.email}
							onChange={handle}
							placeholder='vous@exemple.com'
							required
						/>
					</div>
					<div className={styles.field}>
						<label>Mot de passe</label>
						<input
							name='password'
							type='password'
							value={form.password}
							onChange={handle}
							placeholder='••••••••'
							required
						/>
					</div>
					<button type='submit' className={styles.btn} disabled={loading}>
						{loading ? 'Connexion...' : 'Se connecter'}
					</button>
				</form>
				{import.meta.env.VITE_TEST_USER_EMAIL && (
					<button type='button' className={styles.testBtn} onClick={fillTest}>
						Utiliser le compte de test
					</button>
				)}
				<p className={styles.switch}>
					Pas encore de compte ? <Link to='/register'>Créer un compte</Link>
				</p>
			</div>
		</div>
	)
}
