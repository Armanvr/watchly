import crypto from 'node:crypto'
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
import WatchEvent from '../models/WatchEvent.js'

const router = express.Router()
router.use(protect)

// GET /api/events?date=YYYY-MM-DD  — events for a day (own + shared)
router.get('/', async (req, res) => {
	try {
		const { date, month, year } = req.query
		const filter = {}

		if (date) {
			const start = new Date(date)
			const end = new Date(date)
			end.setDate(end.getDate() + 1)
			filter.watchDate = { $gte: start, $lt: end }
		} else if (month && year) {
			const start = new Date(year, month - 1, 1)
			const end = new Date(year, month, 1)
			filter.watchDate = { $gte: start, $lt: end }
		}

		const events = await WatchEvent.find({
			$or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
			...filter,
		})
			.populate('owner', 'username avatar')
			.populate('sharedWith', 'username avatar')
			.sort({ watchDate: 1, watchTime: 1 })

		res.json(events)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// POST /api/events
router.post('/', async (req, res) => {
	try {
		const event = await WatchEvent.create({ ...req.body, owner: req.user._id })
		await event.populate('owner', 'username avatar')
		res.status(201).json(event)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
	try {
		const event = await WatchEvent.findOne({ _id: req.params.id, owner: req.user._id })
		if (!event) return res.status(404).json({ message: 'Événement introuvable' })

		Object.assign(event, req.body)
		await event.save()
		await event.populate('owner', 'username avatar')
		await event.populate('sharedWith', 'username avatar')
		res.json(event)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
	try {
		const event = await WatchEvent.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		})
		if (!event) return res.status(404).json({ message: 'Événement introuvable' })
		res.json({ message: 'Supprimé' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// POST /api/events/:id/share  — share with user by email/username
router.post('/:id/share', async (req, res) => {
	try {
		const event = await WatchEvent.findOne({ _id: req.params.id, owner: req.user._id })
		if (!event) return res.status(404).json({ message: 'Événement introuvable' })

		const { identifier } = req.body // email or username
		const target = await User.findOne({
			$or: [{ email: identifier }, { username: identifier }],
		})
		if (!target) return res.status(404).json({ message: 'Utilisateur introuvable' })
		if (target._id.equals(req.user._id))
			return res.status(400).json({ message: 'Vous ne pouvez pas vous partager à vous-même' })

		if (!event.sharedWith.includes(target._id)) {
			event.sharedWith.push(target._id)
			await event.save()
		}

		res.json({ message: `Partagé avec ${target.username}` })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// POST /api/events/:id/share-link  — generate a shareable token link
router.post('/:id/share-link', async (req, res) => {
	try {
		const event = await WatchEvent.findOne({ _id: req.params.id, owner: req.user._id })
		if (!event) return res.status(404).json({ message: 'Événement introuvable' })

		if (!event.shareToken) {
			event.shareToken = crypto.randomBytes(20).toString('hex')
			await event.save()
		}

		res.json({ token: event.shareToken })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// GET /api/events/shared/:token  — accept a share link (no auth needed to view, auth to accept)
router.get('/shared/:token', async (req, res) => {
	try {
		const event = await WatchEvent.findOne({ shareToken: req.params.token }).populate('owner', 'username avatar')
		if (!event) return res.status(404).json({ message: 'Lien invalide ou expiré' })
		res.json(event)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// POST /api/events/shared/:token/accept  — add event to own calendar
router.post('/shared/:token/accept', async (req, res) => {
	try {
		const sourceEvent = await WatchEvent.findOne({ shareToken: req.params.token })
		if (!sourceEvent) return res.status(404).json({ message: 'Lien invalide' })

		if (!sourceEvent.sharedWith.includes(req.user._id)) {
			sourceEvent.sharedWith.push(req.user._id)
			await sourceEvent.save()
		}

		res.json({ message: 'Événement ajouté à votre calendrier' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

export default router
