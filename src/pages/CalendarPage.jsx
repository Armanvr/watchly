import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	isSameDay,
	isToday,
	startOfMonth,
	subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCallback, useEffect, useState } from 'react'
import DayPanel from '../components/DayPanel'
import EventModal from '../components/EventModal'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import styles from './CalendarPage.module.css'

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function CalendarPage() {
	const { user } = useAuth()
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedDay, setSelectedDay] = useState(new Date())
	const [events, setEvents] = useState([])
	const [dayEvents, setDayEvents] = useState([])
	const [showModal, setShowModal] = useState(false)
	const [editingEvent, setEditingEvent] = useState(null)
	const [loadingMonth, setLoadingMonth] = useState(false)

	// Fetch month events for calendar dots
	const fetchMonth = useCallback(async () => {
		setLoadingMonth(true)
		try {
			const { data } = await api.get('/events', {
				params: {
					month: currentMonth.getMonth() + 1,
					year: currentMonth.getFullYear(),
				},
			})
			setEvents(data)
		} catch (e) {
			console.error(e)
		} finally {
			setLoadingMonth(false)
		}
	}, [currentMonth])

	// Fetch selected day events
	const fetchDay = useCallback(async () => {
		try {
			const { data } = await api.get('/events', {
				params: { date: format(selectedDay, 'yyyy-MM-dd') },
			})
			setDayEvents(data)
		} catch (e) {
			console.error(e)
		}
	}, [selectedDay])

	useEffect(() => {
		fetchMonth()
	}, [fetchMonth])
	useEffect(() => {
		fetchDay()
	}, [fetchDay])

	const onEventSaved = () => {
		fetchMonth()
		fetchDay()
		setShowModal(false)
		setEditingEvent(null)
	}

	const onEdit = (ev) => {
		setEditingEvent(ev)
		setShowModal(true)
	}
	const onDelete = async (id) => {
		await api.delete(`/events/${id}`)
		fetchMonth()
		fetchDay()
	}

	// Build calendar grid
	const monthStart = startOfMonth(currentMonth)
	const monthEnd = endOfMonth(currentMonth)
	const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

	// Offset so Monday = col 0
	const startOffset = (getDay(monthStart) + 6) % 7

	const getEventsForDay = (day) => events.filter((ev) => isSameDay(new Date(ev.watchDate), day))

	const mediaTypeColor = (type) => {
		if (type === 'movie') return 'var(--movie-color)'
		if (type === 'anime') return 'var(--anime-color)'
		return 'var(--tv-color)'
	}

	return (
		<div className={styles.layout}>
			<Header />

			<main className={styles.main}>
				{/* Calendar section */}
				<section className={styles.calSection}>
					{/* Month nav */}
					<div className={styles.monthNav}>
						<button className={styles.navBtn} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
							‹
						</button>
						<h2 className={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
						<button className={styles.navBtn} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
							›
						</button>
						<button
							className={styles.todayBtn}
							onClick={() => {
								setCurrentMonth(new Date())
								setSelectedDay(new Date())
							}}
						>
							Aujourd'hui
						</button>
					</div>

					{/* Day labels */}
					<div className={styles.dayLabels}>
						{DAYS_FR.map((d) => (
							<span key={d}>{d}</span>
						))}
					</div>

					{/* Grid */}
					<div className={styles.grid} style={{ opacity: loadingMonth ? 0.6 : 1 }}>
						{/* Empty cells for offset */}
						{Array.from({ length: startOffset }).map((_, i) => (
							<div key={`e${i}`} className={styles.emptyCell} />
						))}

						{days.map((day) => {
							const dayEvs = getEventsForDay(day)
							const selected = isSameDay(day, selectedDay)
							const today = isToday(day)

							return (
								<button
									key={day.toString()}
									className={[
										styles.dayCell,
										today ? styles.today : '',
										selected ? styles.selected : '',
										dayEvs.length > 0 ? styles.hasEvents : '',
									].join(' ')}
									onClick={() => setSelectedDay(day)}
								>
									<span className={styles.dayNum}>{format(day, 'd')}</span>
									{dayEvs.length > 0 && (
										<div className={styles.dots}>
											{dayEvs.slice(0, 3).map((ev, i) => (
												<span
													key={i}
													className={styles.dot}
													style={{ background: mediaTypeColor(ev.mediaType) }}
												/>
											))}
											{dayEvs.length > 3 && (
												<span className={styles.dotMore}>+{dayEvs.length - 3}</span>
											)}
										</div>
									)}
								</button>
							)
						})}
					</div>

					{/* Legend */}
					<div className={styles.legend}>
						<span>
							<em style={{ background: 'var(--movie-color)' }} />
							Film
						</span>
						<span>
							<em style={{ background: 'var(--tv-color)' }} />
							Série
						</span>
						<span>
							<em style={{ background: 'var(--anime-color)' }} />
							Anime
						</span>
					</div>
				</section>

				{/* Day panel */}
				<DayPanel
					day={selectedDay}
					events={dayEvents}
					onAdd={() => {
						setEditingEvent(null)
						setShowModal(true)
					}}
					onEdit={onEdit}
					onDelete={onDelete}
					onRefresh={fetchDay}
				/>
			</main>

			{showModal && (
				<EventModal
					event={editingEvent}
					defaultDate={selectedDay}
					onClose={() => {
						setShowModal(false)
						setEditingEvent(null)
					}}
					onSaved={onEventSaved}
				/>
			)}
		</div>
	)
}
