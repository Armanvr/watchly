import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { buildProfileTimelineSections } from '../utils/timeline'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
	const { user } = useAuth()
	const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
	const [status, setStatus] = useState(null)
	const [loading, setLoading] = useState(false)
	const [activeSection, setActiveSection] = useState('timeline')
	const [events, setEvents] = useState([])
	const [eventsLoading, setEventsLoading] = useState(true)
	const [expandedGroup, setExpandedGroup] = useState(null)
	const [seasonCache, setSeasonCache] = useState({})

	const fetchEvents = useCallback(async (active = true) => {
		setEventsLoading(true)
		try {
			const { data } = await api.get('/events')
			if (active) setEvents(data)
		} catch {
			if (active) setEvents([])
		} finally {
			if (active) setEventsLoading(false)
		}
	}, [])

	useEffect(() => {
		let active = true
		fetchEvents(active)
		return () => {
			active = false
		}
	}, [fetchEvents])

	const timelineSections = useMemo(() => buildProfileTimelineSections(events), [events])
	const eventCount = events.length

	const handleMarkWatched = async (event) => {
		await api.put(`/events/${event._id}`, { status: 'completed' })
		await fetchEvents()
	}

	const handleDeleteEvent = async (event) => {
		await api.delete(`/events/${event._id}`)
		await fetchEvents()
	}

	const handleToggleSeason = async (group) => {
		if (group.mediaType === 'movie') return
		if (expandedGroup === group.key) {
			setExpandedGroup(null)
			return
		}

		setExpandedGroup(group.key)
		if (seasonCache[group.key]?.data || seasonCache[group.key]?.loading) return

		const seasonNumber = group.items.find((item) => item.seasonNumber)?.seasonNumber || 1
		setSeasonCache((cache) => ({
			...cache,
			[group.key]: { loading: true, error: '', data: null, seasonNumber },
		}))

		try {
			const { data } = await api.get(`/media/tv/${group.items[0].event.tmdbId}/season/${seasonNumber}`)
			setSeasonCache((cache) => ({
				...cache,
				[group.key]: { loading: false, error: '', data, seasonNumber },
			}))
		} catch (err) {
			setSeasonCache((cache) => ({
				...cache,
				[group.key]: {
					loading: false,
					error: err.response?.data?.message || 'Saison introuvable',
					data: null,
					seasonNumber,
				},
			}))
		}
	}

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
					<div className={styles.titleRow}>
						<div>
							<h1 className={styles.pageTitle}>Mon profil</h1>
							<p className={styles.subtitle}>Timeline de visionnage et réglages du compte.</p>
						</div>
					</div>

					<div className={styles.sectionTabs}>
						<button
							type='button'
							className={activeSection === 'timeline' ? styles.tabActive : styles.tab}
							onClick={() => setActiveSection('timeline')}
						>
							Timeline
						</button>
						<button
							type='button'
							className={activeSection === 'account' ? styles.tabActive : styles.tab}
							onClick={() => setActiveSection('account')}
						>
							Compte
						</button>
					</div>

					<section className={activeSection === 'timeline' ? styles.sectionVisible : styles.sectionHidden}>
						<div className={styles.sectionHeader}>
							<h2 className={styles.sectionTitle}>Timeline</h2>
							<span className={styles.sectionCount}>
								{eventCount} élément{eventCount > 1 ? 's' : ''}
							</span>
						</div>

						{eventsLoading ? (
							<div className={styles.emptyState}>Chargement de la timeline...</div>
						) : (
							<div className={styles.timelineSections}>
								{timelineSections.map((section) => (
									<section key={section.key} className={styles.timelineSection}>
										<div className={styles.timelineSectionHeader}>
											<h3>{section.title}</h3>
											<span>{section.groups.length}</span>
										</div>

										{section.groups.length === 0 ? (
											<div className={styles.sectionEmpty}>Aucun élément.</div>
										) : (
											<div className={styles.timelineList}>
												{section.groups.map((group) => {
													const seasonState = seasonCache[group.key]
													const highlightedEpisodes = new Set(
														group.items
															.filter(
																(item) =>
																	item.seasonNumber === seasonState?.seasonNumber,
															)
															.map((item) => item.episodeNumber)
															.filter(Boolean),
													)

													return (
														<article key={group.key} className={styles.timelineCard}>
															<div className={styles.timelineMedia}>
																{group.posterPath ? (
																	<img
																		src={`${import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'}/w185${group.posterPath}`}
																		alt={group.title}
																		loading='lazy'
																	/>
																) : (
																	<span>{group.mediaTypeLabel?.[0]}</span>
																)}
															</div>
															<div className={styles.timelineContent}>
																<div className={styles.timelineTitleRow}>
																	<div>
																		<button
																			type='button'
																			className={styles.timelineTitleButton}
																			onClick={() => handleToggleSeason(group)}
																		>
																			{group.title}
																		</button>
																		<p className={styles.timelineMeta}>
																			{group.mediaTypeLabel} ·{' '}
																			{group.items.length}{' '}
																			{group.mediaType === 'movie'
																				? 'visionnage'
																				: `épisode${group.items.length > 1 ? 's' : ''}`}
																		</p>
																	</div>
																	{group.mediaType !== 'movie' && (
																		<button
																			type='button'
																			className={styles.seasonBtn}
																			onClick={() => handleToggleSeason(group)}
																		>
																			{expandedGroup === group.key
																				? 'Fermer'
																				: 'Saison'}
																		</button>
																	)}
																</div>

																<div className={styles.episodeList}>
																	{group.items.map((item) => (
																		<div
																			key={item.id}
																			className={`${styles.episodeChip} ${
																				item.highlight === 'green'
																					? styles.episodeDone
																					: item.highlight === 'orange'
																						? styles.episodeLate
																						: ''
																			}`}
																		>
																			<div>
																				<strong>{item.episodeLabel}</strong>
																				<span>
																					{format(
																						item.dateTime,
																						'd MMM · HH:mm',
																						{
																							locale: fr,
																						},
																					)}
																				</span>
																			</div>
																			<div className={styles.episodeActions}>
																				<button
																					type='button'
																					onClick={() =>
																						handleMarkWatched(item.event)
																					}
																					disabled={
																						item.event.status ===
																						'completed'
																					}
																				>
																					Vu
																				</button>
																				<button
																					type='button'
																					className={styles.deleteMiniBtn}
																					onClick={() =>
																						handleDeleteEvent(item.event)
																					}
																				>
																					Supprimer
																				</button>
																			</div>
																		</div>
																	))}
																</div>

																{expandedGroup === group.key &&
																	group.mediaType !== 'movie' && (
																		<div className={styles.seasonPanel}>
																			{seasonState?.loading && (
																				<div className={styles.sectionEmpty}>
																					Chargement TMDB...
																				</div>
																			)}
																			{seasonState?.error && (
																				<div className={styles.seasonError}>
																					{seasonState.error}
																				</div>
																			)}
																			{seasonState?.data && (
																				<>
																					<div
																						className={styles.seasonHeader}
																					>
																						<strong>
																							{seasonState.data.name}
																						</strong>
																						<span>
																							{
																								seasonState.data
																									.episodes.length
																							}{' '}
																							épisodes
																						</span>
																					</div>
																					<div
																						className={
																							styles.seasonEpisodes
																						}
																					>
																						{seasonState.data.episodes.map(
																							(episode) => (
																								<div
																									key={episode.id}
																									className={`${styles.seasonEpisode} ${
																										highlightedEpisodes.has(
																											episode.episodeNumber,
																										)
																											? styles.seasonEpisodeActive
																											: ''
																									}`}
																								>
																									<strong>
																										E
																										{
																											episode.episodeNumber
																										}
																									</strong>
																									<span>
																										{episode.name ||
																											'Sans titre'}
																									</span>
																								</div>
																							),
																						)}
																					</div>
																				</>
																			)}
																		</div>
																	)}
															</div>
														</article>
													)
												})}
											</div>
										)}
									</section>
								))}
							</div>
						)}
					</section>

					<section className={activeSection === 'account' ? styles.sectionVisible : styles.sectionHidden}>
						<div className={styles.sectionHeader}>
							<h2 className={styles.sectionTitle}>Compte</h2>
						</div>

						<div className={styles.accountGrid}>
							<section className={styles.card}>
								<div className={styles.userInfo}>
									<div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
									<div>
										<div className={styles.username}>{user?.username}</div>
										<div className={styles.email}>{user?.email}</div>
									</div>
								</div>
							</section>

							<section className={styles.card}>
								<h3 className={styles.cardTitle}>Changer le mot de passe</h3>
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
										<div
											className={`${styles.statusMsg} ${status.type === 'error' ? styles.statusError : styles.statusSuccess}`}
										>
											{status.msg}
										</div>
									)}

									<button type='submit' className={styles.submitBtn} disabled={loading}>
										{loading ? 'Enregistrement...' : 'Mettre à jour'}
									</button>
								</form>
							</section>
						</div>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	)
}
