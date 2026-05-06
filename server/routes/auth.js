import express from 'express'
import jwt from 'jsonwebtoken'
import { protect } from '../middleware/authMiddleware.js'
import User from '../models/User.js'

const router = express.Router()

const TEST_ID = '000000000000000000000001'

const signToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	})

// POST /api/auth/register
router.post('/register', async (req, res) => {
	try {
		const { username, email, password } = req.body
		if (!username || !email || !password) return res.status(400).json({ message: 'Tous les champs sont requis' })

		const exists = await User.findOne({ $or: [{ email }, { username }] })
		if (exists) return res.status(409).json({ message: 'Email ou pseudo déjà utilisé' })

		const user = await User.create({ username, email, password })
		res.status(201).json({ token: signToken(user._id), user })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body

		if (
			process.env.TEST_USER_EMAIL &&
			process.env.TEST_USER_PASSWORD &&
			email === process.env.TEST_USER_EMAIL &&
			password === process.env.TEST_USER_PASSWORD
		) {
			return res.json({
				token: signToken(TEST_ID),
				user: {
					_id: TEST_ID,
					username: process.env.TEST_USER_USERNAME || 'testuser',
					email: process.env.TEST_USER_EMAIL,
					avatar: '',
					sharedWith: [],
				},
			})
		}

		const user = await User.findOne({ email })
		if (!user || !(await user.comparePassword(password)))
			return res.status(401).json({ message: 'Identifiants invalides' })

		res.json({ token: signToken(user._id), user })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user))

// GET /api/auth/search?q=username  — find users to share with
router.get('/search', protect, async (req, res) => {
	try {
		const { q } = req.query
		if (!q) return res.json([])
		const users = await User.find({
			$or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
			_id: { $ne: req.user._id },
		})
			.select('username email avatar')
			.limit(10)
		res.json(users)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// PATCH /api/auth/profile — change password
router.patch('/profile', protect, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body
		if (!currentPassword || !newPassword)
			return res.status(400).json({ message: 'Mot de passe actuel et nouveau requis' })
		if (newPassword.length < 6)
			return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 6 caractères' })
		if (req.user._id.toString() === TEST_ID)
			return res.status(403).json({ message: 'Compte de test — modification impossible' })

		const userDoc = await User.findById(req.user._id)
		const match = await userDoc.comparePassword(currentPassword)
		if (!match) return res.status(401).json({ message: 'Mot de passe actuel incorrect' })

		userDoc.password = newPassword
		await userDoc.save()
		res.json({ message: 'Mot de passe mis à jour' })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

export default router
