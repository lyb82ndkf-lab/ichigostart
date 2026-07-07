const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('ichigo_token') || ''
}

function setToken(token) {
  localStorage.setItem('ichigo_token', token)
}

function clearToken() {
  localStorage.removeItem('ichigo_token')
}

async function request(url, options = {}) {
  const token = getToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    ...options,
  }
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }
  const res = await fetch(`${API_BASE}${url}`, config)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || '请求失败')
  }
  return data
}

export const auth = {
  login: async (username, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { username, password } })
    if (data.token) setToken(data.token)
    return data
  },
  register: async (username, password, nickname) => {
    const data = await request('/auth/register', { method: 'POST', body: { username, password, nickname } })
    if (data.token) setToken(data.token)
    return data
  },
  logout: async () => {
    try { await request('/auth/logout', { method: 'POST' }) } catch (e) { /* ignore */ }
    clearToken()
  },
  me: () => request('/auth/me'),
  clearToken,
}

export const categories = {
  list: () => request('/categories'),
  create: (name, sort_order) =>
    request('/categories', { method: 'POST', body: { name, sort_order } }),
  update: (id, data) =>
    request(`/categories/${id}`, { method: 'PUT', body: data }),
  remove: (id) =>
    request(`/categories/${id}`, { method: 'DELETE' }),
}

export const bookmarks = {
  list: (categoryId) => {
    const query = categoryId ? `?category_id=${categoryId}` : ''
    return request(`/bookmarks${query}`)
  },
  create: (data) =>
    request('/bookmarks', { method: 'POST', body: data }),
  update: (id, data) =>
    request(`/bookmarks/${id}`, { method: 'PUT', body: data }),
  remove: (id) =>
    request(`/bookmarks/${id}`, { method: 'DELETE' }),
  fetchIcon: (url, signal) => request(`/bookmarks/fetch-icon?url=${encodeURIComponent(url)}`, { signal }),
  uploadIcon: async (file) => {
    const formData = new FormData()
    formData.append('icon', file)
    const token = getToken()
    const res = await fetch(`${API_BASE}/bookmarks/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '上传失败')
    return data
  },
}

export const widgets = {
  list: () => request('/widgets'),
  create: (data) => request('/widgets', { method: 'POST', body: data }),
  update: (id, data) => request(`/widgets/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/widgets/${id}`, { method: 'DELETE' }),
}
