import { useState } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
	const { user } = useAuth()
	const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
	const [status, setStatus] = useState(null)
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

	const handlePasswordSubmit = async (e) => {
		e.preventDefault()
		if (form.newPassword !== form.confirmPassword) {
			setStatus({ type: 'error', msg: 'Les mots de passe ne correspondent pas' })
			return
		}
		setLoading(true)
		setStatus(null)
		try {
			const { data } = await api.patch('/auth/profile', {
				currentPassword: form.currentPassword,
				newPassword: form.newPassword,
			})
			setStatus({ type: 'success', msg: data.message })
			setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
		} catch (err) {
			setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur serveur' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.page}>
			<Header />

			<main className={styles.main}>
				<div className={styles.container}>
					<h1 className={styles.pageTitle}>Mon profil</h1>

					{/* User info */}
					<section className={styles.card}>
						<div className={styles.userInfo}>
							<div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
							<div>
								<div className={styles.username}>{user?.username}</div>
								<div className={styles.email}>{user?.email}</div>
							</div>
						</div>
					</section>

					{/* Change password */}
					<section className={styles.card}>
						<h2 className={styles.cardTitle}>Changer le mot de passe</h2>
						<form onSubmit={handlePasswordSubmit} className={styles.form}>
							<div className={styles.field}>
								<label className={styles.label} htmlFor='currentPassword'>
									Mot de passe actuel
								</label>
								<input
									id='currentPassword'
									name='currentPassword'
									type='password'
									className={styles.input}
									value={form.currentPassword}
									onChange={handleChange}
									autoComplete='current-password'
									required
								/>
							</div>
							<div className={styles.field}>
								<label className={styles.label} htmlFor='newPassword'>
									Nouveau mot de passe
								</label>
								<input
									id='newPassword'
									name='newPassword'
									type='password'
									className={styles.input}
									value={form.newPassword}
									onChange={handleChange}
									autoComplete='new-password'
									minLength={6}
									required
								/>
							</div>
							<div className={styles.field}>
								<label className={styles.label} htmlFor='confirmPassword'>
									Confirmer le nouveau mot de passe
								</label>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type='password'
									className={styles.input}
									value={form.confirmPassword}
									onChange={handleChange}
									autoComplete='new-password'
									minLength={6}
									required
								/>
							</div>

							{status && (
								<div className={`${styles.statusMsg} ${status.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
									{status.msg}
								</div>
							)}

							<button type='submit' className={styles.submitBtn} disabled={loading}>
								{loading ? 'Enregistrement...' : 'Mettre à jour'}
							</button>
						</form>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	)
}
