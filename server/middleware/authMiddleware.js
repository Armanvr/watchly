import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const TEST_ID = '000000000000000000000001'

export const protect = async (req, res, next) => {
	const auth = req.headers.authorization
	if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Non authentifié' })

	try {
		const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)

		if (decoded.id === TEST_ID) {
			req.user = {
				_id: TEST_ID,
				id: TEST_ID,
				username: process.env.TEST_USER_USERNAME || 'testuser',
				email: process.env.TEST_USER_EMAIL,
				avatar: '',
				sharedWith: [],
			}
			return next()
		}

		req.user = await User.findById(decoded.id).select('-password')
		if (!req.user) return res.status(401).json({ message: 'Utilisateur introuvable' })
		next()
	} catch {
		res.status(401).json({ message: 'Token invalide' })
	}
}
