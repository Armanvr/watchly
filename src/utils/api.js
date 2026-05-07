const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const buildUrl = (path, params) => {
	const url = `${BASE_URL}${path}`
	if (!params) return url
	const qs = new URLSearchParams(
		Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)),
	).toString()
	return qs ? `${url}?${qs}` : url
}

const request = async (method, path, { params, body } = {}) => {
	const token = localStorage.getItem('token')
	const headers = {}
	if (token) headers['Authorization'] = `Bearer ${token}`
	if (body !== undefined) headers['Content-Type'] = 'application/json'

	const res = await fetch(buildUrl(path, params), {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})

	const data = await res.json().catch(() => null)

	if (!res.ok) {
		if (res.status === 401 && token !== 'test-mock-token') {
			localStorage.removeItem('token')
			window.location.href = '/login'
		}
		const err = new Error(data?.message || `HTTP ${res.status}`)
		err.response = { status: res.status, data }
		throw err
	}

	return { data }
}

const api = {
	get: (path, opts) => request('GET', path, opts),
	post: (path, body, opts) => request('POST', path, { ...opts, body }),
	put: (path, body, opts) => request('PUT', path, { ...opts, body }),
	patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
	delete: (path, opts) => request('DELETE', path, opts),
}

export default api
