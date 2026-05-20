import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canUnlockAccess, normalizeAccessCode } from './accessGate.js'

describe('access gate', () => {
	it('normalizes access codes before comparison', () => {
		assert.equal(normalizeAccessCode('  AbC-123  '), 'AbC-123')
	})

	it('unlocks only when submitted code matches configured code', () => {
		assert.equal(canUnlockAccess('watchly-2026', ' watchly-2026 '), true)
		assert.equal(canUnlockAccess('watchly-2026', 'wrong'), false)
	})

	it('does not unlock when no configured code exists', () => {
		assert.equal(canUnlockAccess('', 'anything'), false)
	})
})
