const API_BASE = '/api'

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
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
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username, password, nickname) =>
    request('/auth/register', { method: 'POST', body: { username, password, nickname } }),
  logout: () => request('/auth/logout'),
  me: () => request('/auth/me'),
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
  uploadIcon: async (file) => {
    const formData = new FormData()
    formData.append('icon', file)
    const res = await fetch(`${API_BASE}/bookmarks/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '上传失败')
    return data
  },
}
