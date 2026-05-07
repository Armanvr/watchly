import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import styles from './AuthPage.module.css'

const TMDB_IMG = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'

export default function ShareAcceptPage() {
	const { token } = useParams()
	const { user } = useAuth()
	const navigate = useNavigate()
	const [event, setEvent] = useState(null)
	const [loading, setLoading] = useState(true)
	const [accepting, setAccepting] = useState(false)
	const [done, setDone] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		api.get(`/events/shared/${token}`)
			.then(({ data }) => setEvent(data))
			.catch(() => setError('Lien invalide ou expiré'))
			.finally(() => setLoading(false))
	}, [token])

	const accept = async () => {
		if (!user) {
			navigate(`/login?redirect=/share/${token}`)
			return
		}
		setAccepting(true)
		try {
			await api.post(`/events/shared/${token}/accept`)
			setDone(true)
		} catch (err) {
			setError(err.response?.data?.message || 'Erreur')
		} finally {
			setAccepting(false)
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.backdrop} />
			<div className={`${styles.card} scale-in`} style={{ maxWidth: 480 }}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>▶</span>
					<span className={styles.logoText}>Watchly</span>
				</div>

				{loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Chargement...</p>}

				{error && <div className={styles.error}>{error}</div>}

				{event && !done && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
						<div>
							<h2 className={styles.title}>Invitation</h2>
							<p className={styles.sub}>
								<strong>{event.owner?.username}</strong> vous invite à regarder :
							</p>
						</div>

						<div
							style={{
								display: 'flex',
								gap: 14,
								alignItems: 'center',
								background: 'rgba(37,99,235,0.08)',
								border: '1px solid rgba(37,99,235,0.2)',
								borderRadius: 12,
								padding: 14,
							}}
						>
							{event.posterPath && (
								<img
									src={`${TMDB_IMG}/w92${event.posterPath}`}
									alt={event.title}
									style={{ width: 52, height: 74, objectFit: 'cover', borderRadius: 8 }}
								/>
							)}
							<div>
								<div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
									{event.title}
								</div>
								<div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
									{new Date(event.watchDate).toLocaleDateString('fr-FR', {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
									})}
									{event.watchTime && ` à ${event.watchTime}`}
								</div>
							</div>
						</div>

						{!user ? (
							<div style={{ textAlign: 'center' }}>
								<p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
									Connectez-vous pour ajouter cet événement à votre calendrier.
								</p>
								<Link
									to={`/login?redirect=/share/${token}`}
									className={styles.btn}
									style={{
										display: 'inline-block',
										padding: '12px 28px',
										background: 'var(--accent)',
										color: 'white',
										borderRadius: 10,
										textDecoration: 'none',
									}}
								>
									Se connecter
								</Link>
							</div>
						) : (
							<button className={styles.btn} onClick={accept} disabled={accepting}>
								{accepting ? 'Ajout en cours...' : 'Ajouter à mon calendrier'}
							</button>
						)}
					</div>
				)}

				{done && (
					<div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
						<div style={{ fontSize: 48 }}>🎬</div>
						<h2 className={styles.title}>Ajouté !</h2>
						<p className={styles.sub}>L'événement est dans votre calendrier.</p>
						<button className={styles.btn} onClick={() => navigate('/')}>
							Voir mon calendrier
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
