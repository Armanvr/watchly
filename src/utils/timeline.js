const TYPE_LABELS = {
	movie: 'Film',
	tv: 'Série',
	anime: 'Anime',
}

const SECTION_CONFIG = [
	{ key: 'movie', title: 'Films' },
	{ key: 'tv', title: 'Séries' },
	{ key: 'anime', title: 'Animes' },
]

const getEventDateTime = (event) => {
	const datePart = String(event.watchDate || '').slice(0, 10)
	return new Date(`${datePart}T${event.watchTime || '00:00'}`)
}

const getGroupKey = (event) => `${event.mediaType}:${event.tmdbId || event.title}`

export const getMediaTypeLabel = (mediaType) => TYPE_LABELS[mediaType] || mediaType

export const extractSeasonNumber = (episodeLabel = '') => {
	const normalized = String(episodeLabel).trim()
	const seasonMatch = normalized.match(/s(?:aison)?\s*(\d+)/i)
	return seasonMatch ? Number(seasonMatch[1]) : null
}

export const extractEpisodeNumber = (episodeLabel = '') => {
	const normalized = String(episodeLabel).trim()
	const codedMatch = normalized.match(/e(?:pisode)?\s*(\d+)/i)
	if (codedMatch) return Number(codedMatch[1])
	const episodeMatch = normalized.match(/episode\s*(\d+)/i)
	return episodeMatch ? Number(episodeMatch[1]) : null
}

export const buildProfileTimeline = (events, now = new Date()) => {
	const groups = new Map()

	for (const event of events || []) {
		const key = getGroupKey(event)
		if (!groups.has(key)) {
			groups.set(key, {
				key,
				title: event.title,
				mediaType: event.mediaType,
				mediaTypeLabel: getMediaTypeLabel(event.mediaType),
				posterPath: event.posterPath || '',
				backdropPath: event.backdropPath || '',
				items: [],
			})
		}

		const dateTime = getEventDateTime(event)
		const completed = event.status === 'completed'
		const past = dateTime < now

		groups.get(key).items.push({
			id: event._id,
			event,
			dateTime,
			episodeLabel: event.mediaType === 'movie' ? 'Film' : event.episode || 'Épisode',
			seasonNumber: extractSeasonNumber(event.episode),
			episodeNumber: extractEpisodeNumber(event.episode),
			highlight: completed ? 'green' : past ? 'orange' : 'neutral',
		})
	}

	return [...groups.values()]
		.map((group) => ({
			...group,
			items: group.items.sort((a, b) => a.dateTime - b.dateTime),
		}))
		.sort((a, b) => {
			const nextA = a.items.find((item) => item.highlight === 'neutral') || a.items.at(-1)
			const nextB = b.items.find((item) => item.highlight === 'neutral') || b.items.at(-1)
			return nextA.dateTime - nextB.dateTime
		})
}

export const buildProfileTimelineSections = (events, now = new Date()) => {
	const groups = buildProfileTimeline(events, now)
	return SECTION_CONFIG.map((section) => ({
		...section,
		groups: groups.filter((group) => group.mediaType === section.key),
	}))
}
