import mongoose from 'mongoose'

const watchEventSchema = new mongoose.Schema(
	{
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		// Users who received a shared copy of this event
		sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		shareToken: { type: String, unique: true, sparse: true }, // for link-based sharing

		// TMDB data
		tmdbId: { type: Number, required: true },
		mediaType: { type: String, enum: ['movie', 'tv', 'anime'], required: true },
		title: { type: String, required: true },
		posterPath: { type: String, default: '' },
		backdropPath: { type: String, default: '' },
		overview: { type: String, default: '' },
		genres: [{ type: String }],
		rating: { type: Number, default: 0 },
		releaseDate: { type: String, default: '' },

		// Calendar fields
		watchDate: { type: Date, required: true },
		watchTime: { type: String, default: '20:00' }, // HH:MM
		duration: { type: Number, default: 120 }, // minutes
		status: {
			type: String,
			enum: ['planned', 'watching', 'completed', 'dropped'],
			default: 'planned',
		},
		episode: { type: String, default: '' }, // e.g. "S01E05"
		notes: { type: String, default: '' },
		color: { type: String, default: '#2563EB' }, // custom color tag
	},
	{ timestamps: true },
)

// Index for fast calendar queries
watchEventSchema.index({ owner: 1, watchDate: 1 })
watchEventSchema.index({ sharedWith: 1, watchDate: 1 })

export default mongoose.model('WatchEvent', watchEventSchema)
