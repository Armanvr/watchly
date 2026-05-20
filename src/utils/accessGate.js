export const ACCESS_STORAGE_KEY = 'watchly:access-granted'

export const normalizeAccessCode = (value) => String(value || '').trim()

export const canUnlockAccess = (configuredCode, submittedCode) => {
	const expected = normalizeAccessCode(configuredCode)
	const submitted = normalizeAccessCode(submittedCode)
	return expected.length > 0 && submitted === expected
}
