import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import styles from './LandingPage.module.css'

const IMG = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'
const API = import.meta.env.VITE_API_URL || '/api'

const FEATURES = [
	{
		icon: '📅',
		title: 'Timeline visuelle',
		desc: 'Visualisez votre planning de visionnage sur une timeline heure par heure. Ne ratez plus aucune diffusion.',
	},
	{
		icon: '🤝',
		title: 'Partage & collaboration',
		desc: 'Invitez vos amis sur vos événements. Regardez ensemble, commentez, partagez vos découvertes.',
	},
	{
		icon: '🎬',
		title: 'Films, séries, animés',
		desc: 'Suivez tous vos contenus dans un seul endroit. Statuts : planifié, en cours, terminé, abandonné.',
	},
]

export default function LandingPage() {
	const { user, loading } = useAuth()
	const [trending, setTrending] = useState({ movies: [], tv: [] })
	const [trendingLoading, setTrendingLoading] = useState(true)

	useEffect(() => {
		fetch(`${API}/media/trending`)
			.then((r) => r.json())
			.then((data) => setTrending(data))
			.catch(() => {})
			.finally(() => setTrendingLoading(false))
	}, [])

	if (loading) return null
	if (user) return <Navigate to='/app' replace />

	const heroBackdrop = trending.movies[0]?.backdrop_path

	return (
		<div className={styles.page}>
			<Header />

			{/* ── Section 1: Hero ── */}
			<section className={styles.hero}>
				{heroBackdrop && (
					<img
						src={`${IMG}/original${heroBackdrop}`}
						alt=''
						className={styles.heroBg}
						aria-hidden='true'
					/>
				)}
				<div className={styles.heroOverlay} />
				<div className={styles.heroContent}>
					<p className={styles.heroEyebrow}>Votre tracker de visionnage</p>
					<h1 className={styles.heroTitle}>WATCHLY</h1>
					<p className={styles.heroSub}>
						Planifiez, suivez et partagez vos films, séries et animés sur une timeline visuelle.
					</p>
					<div className={styles.heroCtas}>
						<Link to='/register' className={styles.ctaPrimary}>
							Commencer gratuitement
						</Link>
						<Link to='/login' className={styles.ctaSecondary}>
							Se connecter
						</Link>
					</div>
				</div>
			</section>

			{/* ── Section 2: Trending ── */}
			<section className={styles.trending}>
				<div className={styles.sectionHeader}>
					<h2 className={styles.sectionTitle}>Tendances cette semaine</h2>
					<p className={styles.sectionSub}>Films et séries populaires du moment</p>
				</div>

				{trendingLoading ? (
					<div className={styles.posterRow}>
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className={`${styles.posterSkeleton} skeleton`} />
						))}
					</div>
				) : (
					<>
						<p className={styles.rowLabel}>Films</p>
						<div className={styles.posterRow}>
							{trending.movies.map((item) => (
								<div key={item.id} className={styles.posterCard}>
									{item.poster_path ? (
										<img
											src={`${IMG}/w342${item.poster_path}`}
											alt={item.title}
											className={styles.posterImg}
											loading='lazy'
										/>
									) : (
										<div className={styles.posterFallback}>{item.title}</div>
									)}
									<div className={styles.posterOverlay}>
										<span className={styles.posterTitle}>{item.title}</span>
										{item.vote_average > 0 && (
											<span className={styles.posterRating}>
												⭐ {item.vote_average.toFixed(1)}
											</span>
										)}
									</div>
								</div>
							))}
						</div>

						<p className={styles.rowLabel}>Séries</p>
						<div className={styles.posterRow}>
							{trending.tv.map((item) => (
								<div key={item.id} className={styles.posterCard}>
									{item.poster_path ? (
										<img
											src={`${IMG}/w342${item.poster_path}`}
											alt={item.name}
											className={styles.posterImg}
											loading='lazy'
										/>
									) : (
										<div className={styles.posterFallback}>{item.name}</div>
									)}
									<div className={styles.posterOverlay}>
										<span className={styles.posterTitle}>{item.name}</span>
										{item.vote_average > 0 && (
											<span className={styles.posterRating}>
												⭐ {item.vote_average.toFixed(1)}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</section>

			{/* ── Section 3: Features ── */}
			<section className={styles.features}>
				<div className={styles.sectionHeader}>
					<h2 className={styles.sectionTitle}>Tout ce dont vous avez besoin</h2>
					<p className={styles.sectionSub}>Un outil simple pour ne plus jamais perdre le fil</p>
				</div>
				<div className={styles.featureGrid}>
					{FEATURES.map((f) => (
						<div key={f.title} className={styles.featureCard}>
							<span className={styles.featureIcon}>{f.icon}</span>
							<h3 className={styles.featureTitle}>{f.title}</h3>
							<p className={styles.featureDesc}>{f.desc}</p>
						</div>
					))}
				</div>
				<div className={styles.featureCta}>
					<Link to='/register' className={styles.ctaPrimary}>
						Créer mon compte
					</Link>
				</div>
			</section>

			<Footer />
		</div>
	)
}
