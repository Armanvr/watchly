import { format, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import Clock from '../icons/Clock'
import Duration from '../icons/Duration'
import Share from '../icons/Share'
import EventDetailModal from './EventDetailModal'
import styles from './DayPanel.module.css'
import ShareModal from './ShareModal'

const TMDB_IMG = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p'

const PX_PER_MIN = 2.0
const MIN_EVENT_HEIGHT = 84
const START_HOUR = 11
const END_HOUR = 23

const parseTime = (t = '20:00') => {
	const [h = 0, m = 0] = (t || '20:00').split(':').map(Number)
	return { h, m }
}

const timeToTop = (h, m) => ((h - START_HOUR) * 60 + m) * PX_PER_MIN
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN

export default function DayPanel({ day, events, onAdd, onEdit, onDelete, onRefresh }) {
	const [sharing, setSharing] = useState(null)
	const [detail, setDetail] = useState(null)
	const scrollRef = useRef(null)
	const title = isToday(day) ? "Aujourd'hui" : format(day, 'EEEE d MMMM', { locale: fr })

	useEffect(() => {
		if (!scrollRef.current) return
		let targetTop = 0
		if (isToday(day)) {
			const now = new Date()
			const nowTop = timeToTop(now.getHours(), now.getMinutes())
			targetTop = nowTop - scrollRef.current.clientHeight / 2
		} else if (events.length) {
			const first = [...events].sort((a, b) => {
				const ta = parseTime(a.watchTime)
				const tb = parseTime(b.watchTime)
				return ta.h * 60 + ta.m - (tb.h * 60 + tb.m)
			})[0]
			const { h, m } = parseTime(first.watchTime)
			const cardTop = timeToTop(h, m)
			targetTop = cardTop - scrollRef.current.clientHeight / 2 + MIN_EVENT_HEIGHT / 2
		}
		scrollRef.current.scrollTop = Math.max(0, targetTop)
	}, [day, events])

	const handleStatusChange = async (ev, status) => {
		try {
			await api.put(`/events/${ev._id}`, { status })
			onRefresh()
		} catch (e) {
			console.error(e)
		}
	}

	const handleDelete = async (id) => {
		await onDelete(id)
		setDetail(null)
	}

	const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

	return (
		<section className={styles.panel}>
			<div className={styles.header}>
				<div>
					<h2 className={styles.dayTitle}>{title}</h2>
					<span className={styles.count}>
						{events.length === 0
							? 'Aucun visionnage'
							: `${events.length} visionnage${events.length > 1 ? 's' : ''}`}
					</span>
				</div>
				<button className={styles.addBtn} onClick={onAdd}>
					<span>+</span> Ajouter
				</button>
			</div>

			<div className={styles.timelineScroll} ref={scrollRef}>
				{events.length === 0 ? (
					<div className={styles.empty}>
						<div className={styles.emptyIcon}>🍿</div>
						<p>Rien de prévu pour cette journée</p>
						<button className={styles.emptyAdd} onClick={onAdd}>
							Ajouter un visionnage
						</button>
					</div>
				) : (
					<div className={styles.timeline} style={{ height: `${TOTAL_HEIGHT}px` }}>
						{/* Hour grid */}
						{hours.map((h) => (
							<div key={h} className={styles.hourRow} style={{ top: `${timeToTop(h, 0)}px` }}>
								<span className={styles.hourLabel}>{String(h).padStart(2, '0')}:00</span>
								<div className={styles.hourLine} />
							</div>
						))}

						{/* Past veil + current time indicator */}
						{isToday(day) &&
							(() => {
								const now = new Date()
								const nowTop = timeToTop(now.getHours(), now.getMinutes())
								const clampedTop = Math.max(0, Math.min(nowTop, TOTAL_HEIGHT))
								return (
									<>
										{clampedTop > 0 && (
											<div className={styles.pastVeil} style={{ height: `${clampedTop}px` }} />
										)}
										{nowTop >= 0 && nowTop <= TOTAL_HEIGHT && (
											<div className={styles.nowLine} style={{ top: `${nowTop}px` }} />
										)}
									</>
								)
							})()}

						{/* Events */}
						<div className={styles.eventsLayer}>
							{events.map((ev) => {
								const { h, m } = parseTime(ev.watchTime)
								const top = timeToTop(h, m)
								const height = Math.max((ev.duration || 120) * PX_PER_MIN, MIN_EVENT_HEIGHT)
								const typeColor =
									ev.mediaType === 'movie'
										? 'var(--movie-color)'
										: ev.mediaType === 'anime'
											? 'var(--anime-color)'
											: 'var(--tv-color)'

								return (
									<div
										key={ev._id}
										className={styles.timelineCard}
										style={{ top: `${top}px`, height: `${height}px`, borderLeftColor: typeColor }}
										onClick={() => setDetail(ev)}
									>
										{ev.posterPath ? (
											<img
												src={`${TMDB_IMG}/w92${ev.posterPath}`}
												alt={ev.title}
												className={styles.cardPoster}
												loading='lazy'
											/>
										) : (
											<div className={styles.cardPosterFallback}>🎬</div>
										)}
										{ev.sharedWith?.length > 0 && (
											<div className={styles.sharedBadge}>
												<Share />
												<span>{ev.sharedWith.length}</span>
											</div>
										)}
										<div className={styles.cardInfo}>
											<div className={styles.cardTitle}>{ev.title}</div>
											<div className={styles.cardMeta}>
												<span><Clock /> {ev.watchTime}</span>
												<span><Duration /> {ev.duration} min</span>
												{ev.episode && <span>📍 {ev.episode}</span>}
											</div>
											{height >= 110 && (
												<select
													className={styles.statusSelect}
													value={ev.status}
													onChange={(e) => {
														e.stopPropagation()
														handleStatusChange(ev, e.target.value)
													}}
													onClick={(e) => e.stopPropagation()}
													data-status={ev.status}
												>
													{[
														['planned', 'Prévu'],
														['watching', 'En cours'],
														['completed', 'Terminé'],
														['dropped', 'Abandonné'],
													].map(([k, v]) => (
														<option key={k} value={k}>
															{v}
														</option>
													))}
												</select>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>

			{detail && (
				<EventDetailModal
					event={detail}
					onClose={() => setDetail(null)}
					onEdit={(ev) => {
						setDetail(null)
						onEdit(ev)
					}}
					onDelete={handleDelete}
					onShare={(ev) => {
						setDetail(null)
						setSharing(ev)
					}}
					onStatusChange={handleStatusChange}
					onRefresh={onRefresh}
				/>
			)}

			{sharing && <ShareModal event={sharing} onClose={() => setSharing(null)} />}
		</section>
	)
}
