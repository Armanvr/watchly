import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	buildProfileTimeline,
	buildProfileTimelineSections,
	extractEpisodeNumber,
	extractSeasonNumber,
} from './timeline.js'

const now = new Date('2026-05-20T12:00:00.000Z')

describe('profile timeline', () => {
	it('groups calendar events by media and sorts grouped episodes by date', () => {
		const timeline = buildProfileTimeline(
			[
				{
					_id: '2',
					tmdbId: 10,
					mediaType: 'tv',
					title: 'Dark',
					watchDate: '2026-05-19T20:00:00.000Z',
					watchTime: '20:00',
					episode: 'S01E02',
					status: 'planned',
				},
				{
					_id: '1',
					tmdbId: 10,
					mediaType: 'tv',
					title: 'Dark',
					watchDate: '2026-05-18T20:00:00.000Z',
					watchTime: '20:00',
					episode: 'S01E01',
					status: 'completed',
				},
			],
			now,
		)

		assert.equal(timeline.length, 1)
		assert.equal(timeline[0].title, 'Dark')
		assert.deepEqual(
			timeline[0].items.map((item) => item.episodeLabel),
			['S01E01', 'S01E02'],
		)
	})

	it('marks past unwatched items orange and completed items green', () => {
		const timeline = buildProfileTimeline(
			[
				{
					_id: 'movie',
					tmdbId: 20,
					mediaType: 'movie',
					title: 'Dune',
					watchDate: '2026-05-19T20:00:00.000Z',
					watchTime: '20:00',
					status: 'planned',
				},
				{
					_id: 'anime',
					tmdbId: 30,
					mediaType: 'anime',
					title: 'Solo Leveling',
					watchDate: '2026-05-19T22:00:00.000Z',
					watchTime: '22:00',
					episode: 'S02E08',
					status: 'completed',
				},
			],
			now,
		)

		const items = timeline.flatMap((group) => group.items)
		assert.equal(items.find((item) => item.id === 'movie').highlight, 'orange')
		assert.equal(items.find((item) => item.id === 'anime').highlight, 'green')
		assert.equal(items.find((item) => item.id === 'movie').episodeLabel, 'Film')
	})

	it('splits timeline into movie, series and anime sections', () => {
		const sections = buildProfileTimelineSections(
			[
				{ _id: 'movie', tmdbId: 1, mediaType: 'movie', title: 'Dune', watchDate: now, status: 'planned' },
				{ _id: 'tv', tmdbId: 2, mediaType: 'tv', title: 'Dark', watchDate: now, episode: 'S01E01' },
				{ _id: 'anime', tmdbId: 3, mediaType: 'anime', title: 'Bleach', watchDate: now, episode: 'S02E04' },
			],
			now,
		)

		assert.deepEqual(
			sections.map((section) => section.key),
			['movie', 'tv', 'anime'],
		)
		assert.deepEqual(
			sections.map((section) => section.groups.length),
			[1, 1, 1],
		)
	})

	it('extracts season and episode numbers from common episode labels', () => {
		assert.equal(extractSeasonNumber('S02E08'), 2)
		assert.equal(extractEpisodeNumber('S02E08'), 8)
		assert.equal(extractSeasonNumber('s1 e12'), 1)
		assert.equal(extractEpisodeNumber('Episode 7'), 7)
		assert.equal(extractSeasonNumber('Film'), null)
	})
})
