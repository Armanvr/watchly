import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const TMDB = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const KEY = process.env.TMDB_API_KEY

const tmdb = async (path, params = {}) => {
	const url = new URL(`${TMDB}${path}`)
	url.searchParams.set('api_key', KEY)
	url.searchParams.set('language', 'fr-FR')
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
	const res = await fetch(url.toString())
	if (!res.ok) throw new Error(`TMDB error ${res.status}`)
	return res.json()
}

// GET /api/media/trending — PUBLIC (no auth required, used by landing page)
router.get('/trending', async (_req, res) => {
	try {
		const [movies, tv] = await Promise.all([tmdb('/trending/movie/week'), tmdb('/trending/tv/week')])
		res.json({
			movies: (movies.results || []).slice(0, 10),
			tv: (tv.results || []).slice(0, 10),
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// All routes below require authentication
router.use(protect)

// GET /api/media/search?q=...&type=movie|tv|anime
router.get('/search', async (req, res) => {
	try {
		const { q, type = 'multi' } = req.query
		if (!q) return res.json({ results: [] })

		let data
		if (type === 'anime') {
			// Anime = TV shows with genre 16 (Animation) from Japan
			data = await tmdb('/search/tv', { query: q, with_genres: '16', with_origin_country: 'JP' })
		} else {
			data = await tmdb(`/search/${type === 'movie' ? 'movie' : type === 'tv' ? 'tv' : 'multi'}`, { query: q })
		}

		const results = (data.results || []).slice(0, 12).map((item) => ({
			tmdbId: item.id,
			mediaType: type === 'anime' ? 'anime' : item.media_type || type,
			title: item.title || item.name,
			posterPath: item.poster_path,
			backdropPath: item.backdrop_path,
			overview: item.overview,
			rating: item.vote_average,
			releaseDate: item.release_date || item.first_air_date,
			genres: [],
		}))

		res.json({ results })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// GET /api/media/details/:type/:id
router.get('/details/:type/:id', async (req, res) => {
	try {
		const { type, id } = req.params
		const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`
		const data = await tmdb(endpoint)

		res.json({
			tmdbId: data.id,
			mediaType: type,
			title: data.title || data.name,
			posterPath: data.poster_path,
			backdropPath: data.backdrop_path,
			overview: data.overview,
			rating: data.vote_average,
			releaseDate: data.release_date || data.first_air_date,
			genres: (data.genres || []).map((g) => g.name),
			duration: data.runtime || data.episode_run_time?.[0] || 45,
			seasons: data.number_of_seasons,
			episodes: data.number_of_episodes,
		})
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

export default router
