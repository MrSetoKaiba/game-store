const API_BASE = 'http://localhost:8000/api'

async function fetchJson(url) {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function postJson(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${res.status}`)
  }
  return res.json()
}

async function putJson(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${res.status}`)
  }
  return res.json()
}

async function deleteJson(url) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${res.status}`)
  }
  return res.json()
}

// ── Games CRUD ──
export async function createGame(data) { return normalize(await postJson('/games/', data)) }
export async function updateGame(id, data) { return normalize(await putJson(`/games/${id}`, data)) }
export async function deleteGame(id) { return deleteJson(`/games/${id}`) }

// ── Users CRUD ──
export async function createUser(data) { return normalize(await postJson('/users/', data)) }
export async function updateUser(id, data) { return normalize(await putJson(`/users/${id}`, data)) }
export async function deleteUser(id) { return deleteJson(`/users/${id}`) }

// ── Reviews CRUD ──
export async function createReview(data) { return normalize(await postJson('/reviews/', data)) }
export async function updateReview(id, data) { return normalize(await putJson(`/reviews/${id}`, data)) }
export async function deleteReview(id) { return deleteJson(`/reviews/${id}`) }

// ── Publishers CRUD ──
export async function createPublisher(data) { return normalize(await postJson('/publishers/', data)) }
export async function updatePublisher(id, data) { return normalize(await putJson(`/publishers/${id}`, data)) }
export async function deletePublisher(id) { return deleteJson(`/publishers/${id}`) }

// ── Purchases ──
export async function createPurchase(data) { return normalize(await postJson('/purchases/', data)) }

/** Map backend _id to id for frontend consistency */
function normalize(item) {
  if (!item) return item
  const { _id, ...rest } = item
  return { id: _id, ...rest }
}

function normalizeList(items) {
  return (items || []).map(normalize)
}

export async function getGames(limit = 100) {
  const data = await fetchJson(`/games?limit=${limit}`)
  return normalizeList(data)
}

export async function getGame(id) {
  const data = await fetchJson(`/games/${id}`)
  return normalize(data)
}

export async function getTopRatedGames(limit = 10) {
  const data = await fetchJson(`/games/top-rated?limit=${limit}`)
  return normalizeList(data)
}

export async function getUsers(limit = 100) {
  const data = await fetchJson(`/users?limit=${limit}`)
  return normalizeList(data)
}

export async function getUser(id) {
  const data = await fetchJson(`/users/${id}`)
  return normalize(data)
}

export async function getUserLibrary(userId) {
  const data = await fetchJson(`/users/${userId}/library`)
  return normalizeList(data)
}

export async function getUserFriends(userId) {
  const data = await fetchJson(`/users/${userId}/friends`)
  return normalizeList(data)
}

export async function getPublishers() {
  const data = await fetchJson('/publishers')
  return normalizeList(data)
}

export async function getReviews(limit = 100) {
  const data = await fetchJson(`/reviews?limit=${limit}`)
  return normalizeList(data)
}

export async function getPurchases(limit = 100) {
  const data = await fetchJson(`/purchases?limit=${limit}`)
  return normalizeList(data)
}

export async function seedDatabase() {
  const res = await fetch(`http://localhost:8000/api/seed`, { method: 'POST' })
  if (!res.ok) throw new Error(`Seed error: ${res.status}`)
  return res.json()
}

export async function getAlsoBought(gameId, limit = 5) {
  const data = await fetchJson(`/games/${gameId}/also-bought?limit=${limit}`)
  return normalizeList(data)
}

export async function getFriendRecommendations(userId, limit = 10) {
  const data = await fetchJson(`/recommendations/${userId}/friends?limit=${limit}`)
  return normalizeList(data)
}

export async function getSimilarGames(gameId, limit = 3) {
  const data = await fetchJson(`/recommendations/games/${gameId}/similar?limit=${limit}`)
  return data
}

export async function getSimilarGamesByTags(gameId, limit = 3) {
  const data = await fetchJson(`/recommendations/games/${gameId}/similar-by-tags?limit=${limit}`)
  return data
}
