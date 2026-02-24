import { useState, useEffect } from 'react'
import ReviewCard from '../components/ReviewCard'
import Modal from '../components/Modal'
import { getReviews, createReview, updateReview, deleteReview, getGames, getUsers } from '../api'

const emptyForm = { user_id: '', game_id: '', rating: '5', text: '', recommended: true, playtime_hours: '' }

function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [games, setGames] = useState([])
  const [users, setUsers] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getReviews(), getGames(), getUsers()])
      .then(([r, g, u]) => { setReviews(r); setGames(g); setUsers(u) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(null); setModalOpen(true) }
  const openEdit = (review) => {
    setEditing(review)
    setForm({
      user_id: review.user_id || '',
      game_id: review.game_id || '',
      rating: review.rating?.toString() || '5',
      text: review.text || '',
      recommended: review.recommended !== false,
      playtime_hours: review.playtime_hours || ''
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user_id || !form.game_id) { setFormError('User und Spiel sind Pflichtfelder'); return }
    setSaving(true); setFormError(null)
    try {
      const data = {
        ...form,
        rating: parseInt(form.rating),
        playtime_hours: form.playtime_hours ? parseFloat(form.playtime_hours) : null
      }
      if (editing) {
        await updateReview(editing.id, { rating: data.rating, text: data.text, recommended: data.recommended, playtime_hours: data.playtime_hours })
      } else {
        await createReview(data)
      }
      setModalOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (review) => {
    if (!confirm('Review wirklich löschen?')) return
    try {
      await deleteReview(review.id)
      load()
    } catch (err) { alert(err.message) }
  }

  // Helper: resolve IDs to names
  const userMap = Object.fromEntries(users.map(u => [u.id, u.display_name || u.username]))
  const gameMap = Object.fromEntries(games.map(g => [g.id, g.title]))

  const enrichedReviews = reviews.map(r => ({
    ...r,
    user: userMap[r.user_id] || r.user_id,
    game: gameMap[r.game_id] || r.game_id
  }))

  const sortedReviews = [...enrichedReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      case 'oldest':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      case 'highest_rated':
        return b.rating - a.rating
      case 'lowest_rated':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (loading) return <div className="loading-state">Reviews werden geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>

  const positiveCount = reviews.filter(r => r.recommended).length
  const negativeCount = reviews.length - positiveCount
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-header__title">Community Reviews</h1>
        <p className="page-header__subtitle">{reviews.length} Reviews von unserer Community</p>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openCreate}>+ Neue Review</button>
        </div>
      </div>

      <div className="reviews-summary" style={{ marginBottom: '2rem' }}>
        <div className="reviews-summary__score">
          <div className="reviews-summary__number">{reviews.length}</div>
          <div className="reviews-summary__label">Reviews</div>
        </div>
        <div className="reviews-summary__score">
          <div className="reviews-summary__number" style={{ color: 'var(--accent-success)' }}>
            {reviews.length > 0 ? `${Math.round((positiveCount / reviews.length) * 100)}%` : '—'}
          </div>
          <div className="reviews-summary__label">Positiv</div>
        </div>
        <div className="reviews-summary__score">
          <div className="reviews-summary__number" style={{ color: 'var(--accent-danger)' }}>
            {reviews.length > 0 ? `${Math.round((negativeCount / reviews.length) * 100)}%` : '—'}
          </div>
          <div className="reviews-summary__label">Negativ</div>
        </div>
        <div className="reviews-summary__score">
          <div className="reviews-summary__number" style={{ color: 'var(--accent-gold)' }}>
            {avgRating}
          </div>
          <div className="reviews-summary__label">Durchschnitt</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', alignItems: 'center', gap: '1rem' }}>
        <label style={{ margin: 0, color: 'var(--text-muted)' }}>Sortieren nach:</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
          <option value="highest_rated">Beste Bewertung</option>
          <option value="lowest_rated">Schlechteste Bewertung</option>
        </select>
      </div>

      <div className="reviews-list stagger">
        {sortedReviews.map(review => (
          <div key={review.id}>
            <ReviewCard review={review} />
            <div className="card-actions" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <button className="btn btn--ghost btn--sm" onClick={() => openEdit(review)}>Bearbeiten</button>
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(review)}>Löschen</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Review bearbeiten' : 'Neue Review'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="form-error">{formError}</div>}
          {!editing && (
            <div className="form-row">
              <div className="form-group">
                <label>User *</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}>
                  <option value="">User wählen...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.display_name || u.username}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Spiel *</label>
                <select value={form.game_id} onChange={e => setForm({ ...form, game_id: e.target.value })}>
                  <option value="">Spiel wählen...</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Bewertung (1-5) *</label>
              <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Spielzeit (Stunden)</label>
              <input type="number" min="0" value={form.playtime_hours} onChange={e => setForm({ ...form, playtime_hours: e.target.value })} placeholder="z.B. 42" />
            </div>
          </div>
          <div className="form-group">
            <label>Review-Text</label>
            <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Deine Meinung zum Spiel..." />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={form.recommended} onChange={e => setForm({ ...form, recommended: e.target.checked })} style={{ width: 'auto' }} />
              Empfohlen
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Abbrechen</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ReviewsPage
