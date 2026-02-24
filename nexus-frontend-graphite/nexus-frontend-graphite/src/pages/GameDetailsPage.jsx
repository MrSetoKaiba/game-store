import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGame, updateGame, deleteGame } from '../api'
import { useApp } from '../AppContext'
import Modal from '../components/Modal'
import GiftIcon from '../components/GiftIcon'

function GameDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [added, setAdded] = useState(false)

  const load = () => {
    setLoading(true)
    getGame(id)
      .then(setGame)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const openEdit = () => {
    setForm({
      title: game.title || '',
      description: game.description || '',
      price: game.price != null ? game.price : '',
      release_date: game.release_date || '',
      cover_url: game.cover_url || '',
      platforms: (game.platforms || []).join(', '),
      tag_names: (game.tag_names || []).join(', ')
    })
    setFormError(null)
    setEditOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Titel ist Pflichtfeld'); return }
    setSaving(true); setFormError(null)
    try {
      const data = {
        title: form.title,
        description: form.description,
        price: form.price !== '' ? parseFloat(form.price) : 0,
        release_date: form.release_date || null,
        cover_url: form.cover_url || null,
        platforms: form.platforms ? form.platforms.split(',').map(s => s.trim()).filter(Boolean) : [],
        tag_names: form.tag_names ? form.tag_names.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      await updateGame(id, data)
      setEditOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`"${game.title}" wirklich löschen?`)) return
    try {
      await deleteGame(id)
      navigate('/')
    } catch (err) { alert(err.message) }
  }

  const handleAddToCart = () => {
    addToCart(game)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = () => {
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id)
    } else {
      addToWishlist(game)
    }
  }

  if (loading) return <div className="loading-state">Spiel wird geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>
  if (!game) return <div className="error-state">Spiel nicht gefunden</div>

  const isFree = game.price === 0
  const alreadyInCart = isInCart(game.id)

  return (
    <div className="animate-fadeIn">
      <div className="game-details">
        <div className="game-details__main">
          <div className="game-details__hero">
            <img src={game.cover_url || `https://picsum.photos/seed/${game.id}/1200/675`} alt={game.title} className="game-details__hero-image" />
          </div>
          <div className="game-details__description">
            <h3>Über das Spiel</h3>
            <p>{game.description}</p>
          </div>
        </div>

        <div className="game-details__sidebar">
          <div className="game-details__buy-box">
            <h1 className="game-details__title">{game.title}</h1>
            <span className="game-details__publisher-link">{game.publisher_id || 'Unbekannter Publisher'}</span>
            <div className="game-details__price-box">
              <span className="game-details__price">
                {isFree ? 'Kostenlos' : `${game.price.toFixed(2)} €`}
              </span>
            </div>
            <div className="game-details__buttons">
              {alreadyInCart ? (
                <button className="btn btn--secondary btn--lg" style={{ width: '100%' }} disabled>
                  ✓ Im Warenkorb
                </button>
              ) : added ? (
                <button className="btn btn--success btn--lg" style={{ width: '100%' }} disabled>
                  ✓ Hinzugefügt!
                </button>
              ) : (
                <button className="btn btn--success btn--lg" style={{ width: '100%' }} onClick={handleAddToCart}>
                  🛒 {isFree ? 'Jetzt spielen' : 'In den Warenkorb'}
                </button>
              )}
              <button
                className={`btn ${isInWishlist(game.id) ? 'btn--ghost' : 'btn--secondary'}`}
                style={{ width: '100%' }}
                onClick={handleWishlist}
              >
                <GiftIcon filled={isInWishlist(game.id)} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {isInWishlist(game.id) ? 'Auf Wunschliste' : 'Wunschliste'}
              </button>
              <button className="btn btn--secondary" style={{ width: '100%' }} onClick={openEdit}>
                ✏️ Bearbeiten
              </button>
              <button className="btn btn--danger" style={{ width: '100%' }} onClick={handleDelete}>
                🗑️ Spiel löschen
              </button>
            </div>
          </div>

          <div className="game-details__info-card">
            <h4>Spieldetails</h4>
            {game.publisher_id && (
              <div className="game-details__info-row">
                <span className="game-details__info-label">Publisher</span>
                <span className="game-details__info-value">{game.publisher_id}</span>
              </div>
            )}
            {game.platforms && game.platforms.length > 0 && (
              <div className="game-details__info-row">
                <span className="game-details__info-label">Plattformen</span>
                <span className="game-details__info-value">{game.platforms.join(', ')}</span>
              </div>
            )}
            {game.release_date && (
              <div className="game-details__info-row">
                <span className="game-details__info-label">Release</span>
                <span className="game-details__info-value">{game.release_date}</span>
              </div>
            )}
            {game.tag_names && game.tag_names.length > 0 && (
              <div className="game-details__tags">
                {game.tag_names.map(tag => (
                  <span key={tag} className="game-details__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Spiel bearbeiten">
        <form onSubmit={handleUpdate}>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label>Titel *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preis (€)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Release-Datum</label>
              <input value={form.release_date} onChange={e => setForm({ ...form, release_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Cover-URL</label>
            <input value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Plattformen</label>
              <input value={form.platforms} onChange={e => setForm({ ...form, platforms: e.target.value })} placeholder="PC, PS5, Xbox" />
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input value={form.tag_names} onChange={e => setForm({ ...form, tag_names: e.target.value })} placeholder="Action, RPG" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setEditOpen(false)}>Abbrechen</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default GameDetailsPage
