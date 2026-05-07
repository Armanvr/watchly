import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true, minlength: 6 },
		avatar: { type: String, default: '' },
		// Users this person has shared their calendar with
		sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true },
)

// Hash password before save
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 12)
	next()
})

userSchema.methods.comparePassword = async function (candidate) {
	return bcrypt.compare(candidate, this.password)
}

// Don't expose password
userSchema.methods.toJSON = function () {
	const obj = this.toObject()
	delete obj.password
	return obj
}

export default mongoose.model('User', userSchema)
