import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
	const { register } = useAuth()
	const [form, setForm] = useState({ username: '', email: '', password: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

	const submit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await register(form.username, form.email, form.password)
		} catch (err) {
			setError(err.response?.data?.message || "Erreur lors de l'inscription")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.backdrop} />
			<div className={`${styles.card} scale-in`}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>▶</span>
					<span className={styles.logoText}>Watchly</span>
				</div>
				<h1 className={styles.title}>Créer un compte</h1>
				<p className={styles.sub}>Commencez à organiser vos soirées ciné</p>
				{error && <div className={styles.error}>{error}</div>}
				<form onSubmit={submit} className={styles.form}>
					<div className={styles.field}>
						<label>Pseudo</label>
						<input
							name='username'
							value={form.username}
							onChange={handle}
							placeholder='votre_pseudo'
							required
						/>
					</div>
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
							placeholder='6 caractères minimum'
							minLength={6}
							required
						/>
					</div>
					<button type='submit' className={styles.btn} disabled={loading}>
						{loading ? 'Création...' : 'Créer mon compte'}
					</button>
				</form>
				<p className={styles.switch}>
					Déjà un compte ? <Link to='/login'>Se connecter</Link>
				</p>
			</div>
		</div>
	)
}
