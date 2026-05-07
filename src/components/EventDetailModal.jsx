import Clock from '../icons/Clock'
import Duration from '../icons/Duration'
import Pencil from '../icons/Pencil'
import Share from '../icons/Share'
import Trash from '../icons/Trash'
import Tv from '../icons/Tv'
import styles from './EventDetailModal.module.css'

const TMDB_IMG = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'

const STATUS_LABELS = {
	planned: 'Prévu',
	watching: 'En cours',
	completed: 'Terminé',
	dropped: 'Abandonné',
}

const STATUS_COLORS = {
	planned: 'var(--accent)',
	watching: '#d97706',
	completed: '#16a34a',
	dropped: '#dc2626',
}

const TYPE_CONFIG = {
	movie: { icon: '🎬', label: 'Film' },
	tv: { icon: <Tv />, label: 'Série' },
	anime: { icon: '✨', label: 'Anime' },
}

export default function EventDetailModal({ event: ev, onClose, onEdit, onDelete, onShare }) {
	const typeColor =
		ev.mediaType === 'movie'
			? 'var(--movie-color)'
			: ev.mediaType === 'anime'
				? 'var(--anime-color)'
				: 'var(--tv-color)'

	return (
		<div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className={`${styles.modal} scale-in`}>
				{/* Backdrop */}
				{ev.backdropPath ? (
					<div className={styles.backdrop}>
						<img src={`${TMDB_IMG}/w780${ev.backdropPath}`} alt='' />
						<div className={styles.backdropGradient} />
					</div>
				) : (
					<div className={styles.backdropEmpty} style={{ background: typeColor + '22' }} />
				)}

				{/* Close */}
				<button className={styles.close} onClick={onClose}>
					✕
				</button>

				<div className={styles.content}>
					{/* Top: poster + title block */}
					<div className={styles.hero}>
						{ev.posterPath ? (
							<img
								src={`${TMDB_IMG}/w185${ev.posterPath}`}
								alt={ev.title}
								className={styles.poster}
							/>
						) : (
							<div className={styles.posterFallback}>{TYPE_CONFIG[ev.mediaType]?.icon}</div>
						)}

						<div className={styles.heroInfo}>
							<div className={styles.typeBadge} style={{ background: typeColor }}>
								{TYPE_CONFIG[ev.mediaType]?.icon}
								{' '}{TYPE_CONFIG[ev.mediaType]?.label || ev.mediaType}
							</div>
							<h2 className={styles.title}>{ev.title}</h2>
							<div className={styles.meta}>
								{ev.releaseDate && <span>{ev.releaseDate.slice(0, 4)}</span>}
								{ev.rating > 0 && <span>★ {Number(ev.rating).toFixed(1)}</span>}
								{ev.genres?.length > 0 && <span>{ev.genres.slice(0, 3).join(' · ')}</span>}
							</div>
						</div>
					</div>

					{/* Watch info */}
					<div className={styles.watchInfo}>
						<div className={styles.watchInfoItem}>
							<span className={styles.watchInfoLabel}>Heure</span>
							<span className={styles.watchInfoValue}><Clock /> {ev.watchTime}</span>
						</div>
						<div className={styles.watchInfoItem}>
							<span className={styles.watchInfoLabel}>Durée</span>
							<span className={styles.watchInfoValue}><Duration /> {ev.duration} min</span>
						</div>
						{ev.episode && (
							<div className={styles.watchInfoItem}>
								<span className={styles.watchInfoLabel}>Épisode</span>
								<span className={styles.watchInfoValue}>📍 {ev.episode}</span>
							</div>
						)}
						<div className={styles.watchInfoItem}>
							<span className={styles.watchInfoLabel}>Statut</span>
							<span
								className={styles.statusBadge}
								style={{ background: STATUS_COLORS[ev.status] + '22', color: STATUS_COLORS[ev.status] }}
							>
								{STATUS_LABELS[ev.status]}
							</span>
						</div>
					</div>

					{/* Overview */}
					{ev.overview && <p className={styles.overview}>{ev.overview}</p>}

					{/* Notes */}
					{ev.notes && (
						<div className={styles.notes}>
							<span className={styles.notesLabel}>Notes</span>
							<p>{ev.notes}</p>
						</div>
					)}

					{/* Shared with */}
					{ev.sharedWith?.length > 0 && (
						<div className={styles.sharedRow}>
							<span className={styles.notesLabel}>Partagé avec</span>
							<div className={styles.sharedList}>
								{ev.sharedWith.map((u) => (
									<span key={u._id || u} className={styles.sharedChip}>
										{u.username || u}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className={styles.actions}>
						<button className={styles.actionEdit} onClick={() => onEdit(ev)}>
							<Pencil /> Modifier
						</button>
						<button className={styles.actionShare} onClick={() => onShare(ev)}>
							<Share /> Partager
						</button>
						<button className={styles.actionDelete} onClick={() => onDelete(ev._id)}>
							<Trash /> Supprimer
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
