import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import styles from './EventModal.module.css'

const TMDB_IMG = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'

export default function EventModal({ event, defaultDate, onClose, onSaved }) {
	const isEdit = !!event
	const searchRef = useRef(null)

	const [step, setStep] = useState(isEdit ? 'form' : 'search')
	const [searchQ, setSearchQ] = useState('')
	const [searchType, setSearchType] = useState('multi')
	const [results, setResults] = useState([])
	const [searching, setSearching] = useState(false)
	const [selected, setSelected] = useState(null)

	const [form, setForm] = useState({
		watchDate: format(defaultDate || new Date(), 'yyyy-MM-dd'),
		watchTime: '20:00',
		duration: 120,
		status: 'planned',
		episode: '',
		notes: '',
		color: '#2563eb',
		...(isEdit
			? {
					...event,
					watchDate: format(new Date(event.watchDate), 'yyyy-MM-dd'),
				}
			: {}),
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	// Shared users state
	const [sharedUsers, setSharedUsers] = useState(
		isEdit && Array.isArray(event.sharedWith)
			? event.sharedWith.filter((u) => typeof u === 'object')
			: [],
	)
	const [userSearch, setUserSearch] = useState('')
	const [userResults, setUserResults] = useState([])
	const [searchingUser, setSearchingUser] = useState(false)

	useEffect(() => {
		if (step === 'search') searchRef.current?.focus()
	}, [step])

	// Debounced user search
	useEffect(() => {
		if (userSearch.length < 2) {
			setUserResults([])
			return
		}
		const t = setTimeout(async () => {
			setSearchingUser(true)
			try {
				const { data } = await api.get('/auth/search', { params: { q: userSearch } })
				setUserResults(data.filter((u) => !sharedUsers.some((s) => s._id === u._id)))
			} catch {
				setUserResults([])
			} finally {
				setSearchingUser(false)
			}
		}, 300)
		return () => clearTimeout(t)
	}, [userSearch, sharedUsers])

	const addUser = (u) => {
		setSharedUsers((prev) => [...prev, u])
		setUserSearch('')
		setUserResults([])
	}

	const removeUser = (id) => setSharedUsers((prev) => prev.filter((u) => u._id !== id))

	const doSearch = async () => {
		if (!searchQ.trim()) return
		setSearching(true)
		try {
			const { data } = await api.get('/media/search', { params: { q: searchQ, type: searchType } })
			setResults(data.results || [])
		} catch (e) {
			console.error(e)
		} finally {
			setSearching(false)
		}
	}

	const pickMedia = async (item) => {
		try {
			const type = item.mediaType === 'anime' ? 'tv' : item.mediaType
			const { data } = await api.get(`/media/details/${type}/${item.tmdbId}`)
			setSelected({ ...item, ...data, mediaType: item.mediaType })
			setForm((f) => ({
				...f,
				tmdbId: item.tmdbId,
				mediaType: item.mediaType,
				title: item.title,
				posterPath: item.posterPath,
				backdropPath: item.backdropPath,
				overview: item.overview,
				genres: data.genres || [],
				rating: item.rating,
				releaseDate: item.releaseDate,
				duration: data.duration || 45,
			}))
		} catch {
			setSelected(item)
			setForm((f) => ({ ...f, ...item }))
		}
		setStep('form')
	}

	const handleF = (e) => {
		const { name, value } = e.target
		setForm((f) => ({ ...f, [name]: value }))
	}

	const submit = async () => {
		setError('')
		setSaving(true)
		try {
			const payload = { ...form, sharedWith: sharedUsers.map((u) => u._id) }
			if (!isEdit) {
				const watchDT = new Date(`${payload.watchDate}T${payload.watchTime}`)
				if (watchDT < new Date()) payload.status = 'dropped'
			}
			if (isEdit) {
				await api.put(`/events/${event._id}`, payload)
			} else {
				await api.post('/events', payload)
			}
			onSaved()
		} catch (err) {
			setError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
		} finally {
			setSaving(false)
		}
	}

	const mediaForForm = isEdit ? event : selected

	return (
		<div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className={`${styles.modal} scale-in`}>
				{/* Header */}
				<div className={styles.modalHeader}>
					{step === 'form' && !isEdit && (
						<button className={styles.back} onClick={() => setStep('search')}>
							← Retour
						</button>
					)}
					<h2 className={styles.modalTitle}>
						{isEdit ? 'Modifier' : step === 'search' ? 'Ajouter un visionnage' : 'Détails du visionnage'}
					</h2>
					<button className={styles.close} onClick={onClose}>
						✕
					</button>
				</div>

				{/* SEARCH STEP */}
				{step === 'search' && (
					<div className={styles.searchStep}>
						<div className={styles.typeToggle}>
							{[
								['multi', 'Tout'],
								['movie', 'Films'],
								['tv', 'Séries'],
								['anime', 'Animes'],
							].map(([v, l]) => (
								<button
									key={v}
									className={searchType === v ? styles.typeActive : styles.typeBtn}
									onClick={() => setSearchType(v)}
								>
									{l}
								</button>
							))}
						</div>

						<div className={styles.searchBar}>
							<input
								ref={searchRef}
								value={searchQ}
								onChange={(e) => setSearchQ(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && doSearch()}
								placeholder='Rechercher un film, série ou anime...'
								className={styles.searchInput}
							/>
							<button className={styles.searchBtn} onClick={doSearch} disabled={searching}>
								{searching ? '...' : '🔍'}
							</button>
						</div>

						{results.length > 0 && (
							<div className={styles.results}>
								{results.map((item) => (
									<button
										key={item.tmdbId + item.mediaType}
										className={styles.resultItem}
										onClick={() => pickMedia(item)}
									>
										{item.posterPath ? (
											<img src={`${TMDB_IMG}/w92${item.posterPath}`} alt={item.title} />
										) : (
											<div className={styles.noPoster}>🎬</div>
										)}
										<div className={styles.resultInfo}>
											<span className={styles.resultTitle}>{item.title}</span>
											<span className={styles.resultMeta}>
												{item.releaseDate?.slice(0, 4)} ·{' '}
												{item.mediaType === 'movie'
													? 'Film'
													: item.mediaType === 'anime'
														? 'Anime'
														: 'Série'}
												{item.rating > 0 && ` · ★ ${item.rating.toFixed(1)}`}
											</span>
										</div>
										<span className={styles.resultArrow}>›</span>
									</button>
								))}
							</div>
						)}

						{results.length === 0 && searchQ && !searching && (
							<p className={styles.noResult}>Aucun résultat. Essayez un autre terme.</p>
						)}
					</div>
				)}

				{/* FORM STEP */}
				{step === 'form' && (
					<div className={styles.formStep}>
						{/* Media preview */}
						{mediaForForm && (
							<div className={styles.mediaPreview}>
								{mediaForForm.posterPath && (
									<img
										src={`${TMDB_IMG}/w92${mediaForForm.posterPath}`}
										alt={mediaForForm.title}
										className={styles.previewImg}
									/>
								)}
								<div>
									<div className={styles.previewTitle}>{mediaForForm.title}</div>
									<div className={styles.previewMeta}>
										{mediaForForm.releaseDate?.slice(0, 4)}
										{mediaForForm.genres?.length > 0 &&
											` · ${mediaForForm.genres.slice(0, 2).join(', ')}`}
										{mediaForForm.rating > 0 && ` · ★ ${Number(mediaForForm.rating).toFixed(1)}`}
									</div>
								</div>
							</div>
						)}

						{error && <div className={styles.error}>{error}</div>}

						<div className={styles.grid2}>
							<div className={styles.field}>
								<label>Date de visionnage</label>
								<input type='date' name='watchDate' value={form.watchDate} onChange={handleF} />
							</div>
							<div className={styles.field}>
								<label>Heure</label>
								<input type='time' name='watchTime' value={form.watchTime} onChange={handleF} />
							</div>
							<div className={styles.field}>
								<label>Durée (min)</label>
								<input type='number' name='duration' value={form.duration} onChange={handleF} min={1} />
							</div>
							<div className={styles.field}>
								<label>Statut</label>
								<select name='status' value={form.status} onChange={handleF}>
									<option value='planned'>Prévu</option>
									<option value='watching'>En cours</option>
									<option value='completed'>Terminé</option>
									<option value='dropped'>Abandonné</option>
								</select>
							</div>
						</div>

						{form.mediaType !== 'movie' && (
							<div className={styles.field}>
								<label>Épisode (optionnel)</label>
								<input name='episode' value={form.episode} onChange={handleF} placeholder='ex: S01E05' />
							</div>
						)}

						<div className={styles.field}>
							<label>Notes personnelles</label>
							<textarea
								name='notes'
								value={form.notes}
								onChange={handleF}
								rows={2}
								placeholder='Vos impressions, rappels...'
							/>
						</div>

						{/* Share with users */}
						<div className={styles.field}>
							<label>Inviter des spectateurs</label>
							{sharedUsers.length > 0 && (
								<div className={styles.userChips}>
									{sharedUsers.map((u) => (
										<span key={u._id} className={styles.userChip}>
											{u.username}
											<button
												className={styles.userChipRemove}
												onClick={() => removeUser(u._id)}
											>
												✕
											</button>
										</span>
									))}
								</div>
							)}
							<div className={styles.userSearchWrap}>
								<input
									value={userSearch}
									onChange={(e) => setUserSearch(e.target.value)}
									placeholder='Rechercher par pseudo ou email...'
									className={styles.userSearchInput}
									autoComplete='off'
								/>
								{searchingUser && <span className={styles.userSearchSpinner}>...</span>}
							</div>
							{userResults.length > 0 && (
								<div className={styles.userDropdown}>
									{userResults.map((u) => (
										<button
											key={u._id}
											className={styles.userDropdownItem}
											onClick={() => addUser(u)}
										>
											<span className={styles.userDropdownAvatar}>
												{u.username[0].toUpperCase()}
											</span>
											<span className={styles.userDropdownName}>{u.username}</span>
											<span className={styles.userDropdownEmail}>{u.email}</span>
										</button>
									))}
								</div>
							)}
							{userSearch.length >= 2 && !searchingUser && userResults.length === 0 && (
								<p className={styles.userNoResult}>Aucun utilisateur trouvé</p>
							)}
						</div>

						<div className={styles.formActions}>
							<button className={styles.cancelBtn} onClick={onClose}>
								Annuler
							</button>
							<button className={styles.saveBtn} onClick={submit} disabled={saving}>
								{saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Ajouter au calendrier'}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
