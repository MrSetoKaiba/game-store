import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'
import FeaturedCarousel from '../components/FeaturedCarousel'
import Modal from '../components/Modal'
import { useApp } from '../AppContext'
import { getGames, createGame, deleteGame, getPublishers, createPublisher } from '../api'

const emptyForm = { title: '', description: '', price: '', release_date: '', publisher_id: '', newPublisherName: '', cover_url: '', platforms: '', tag_names: '' }

function HomePage() {
  const { activeGenre, setActiveGenre, searchQuery } = useApp()
  const [games, setGames] = useState([])
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getGames(), getPublishers()])
      .then(([g, p]) => { setGames(g); setPublishers(p) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setFormError(null); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) { setFormError('Titel und Beschreibung sind Pflichtfelder'); return }
    setSaving(true); setFormError(null)
    try {
      let finalPublisherId = form.publisher_id || null

      // Attempt to create a new publisher on the fly if user chose 'NEW'
      if (form.publisher_id === 'NEW') {
        if (!form.newPublisherName.trim()) {
          setFormError('Bitte gib einen Namen für den neuen Publisher ein.')
          setSaving(false)
          return
        }
        const newPub = await createPublisher({ name: form.newPublisherName.trim() })
        finalPublisherId = newPub.id
      }

      const data = {
        title: form.title,
        description: form.description,
        price: form.price ? parseFloat(form.price) : 0,
        release_date: form.release_date || null,
        publisher_id: finalPublisherId,
        cover_url: form.cover_url || null,
        platforms: form.platforms ? form.platforms.split(',').map(s => s.trim()).filter(Boolean) : [],
        tag_names: form.tag_names ? form.tag_names.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      await createGame(data)
      setModalOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (gameId, title) => {
    if (!confirm(`"${title}" wirklich löschen?`)) return
    try {
      await deleteGame(gameId)
      load()
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div className="loading-state">Spiele werden geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>

  // Filter by active genre and search query
  const filteredGames = games.filter(g => {
    const matchesGenre = activeGenre ? (g.tag_names && g.tag_names.includes(activeGenre)) : true
    const matchesSearch = searchQuery
      ? (g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
    return matchesGenre && matchesSearch
  })

  const freeGames = filteredGames.filter(g => g.price === 0)

  // Shuffle games to get random ones for the carousel
  const shuffledGames = [...games].sort(() => 0.5 - Math.random())

  return (
    <div className="animate-fadeIn">
      {!activeGenre && <FeaturedCarousel games={shuffledGames} />}

      {activeGenre && (
        <div className="genre-filter-banner">
          <h2>Kategorie: {activeGenre}</h2>
          <span>{filteredGames.length} Spiele gefunden</span>
          <button className="btn btn--ghost btn--sm" onClick={() => setActiveGenre(null)}>✕ Filter entfernen</button>
        </div>
      )}

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{activeGenre ? `${activeGenre} Spiele` : 'Alle Spiele'}</h2>
          <button className="btn btn--primary btn--sm" onClick={openCreate}>+ Neues Spiel</button>
        </div>
        <div className="games-grid stagger">
          {filteredGames.map(game => (
            <div key={game.id} style={{ position: 'relative' }}>
              <GameCard game={game} />
              <div className="card-actions">
                <Link to={`/games/${game.id}`} className="btn btn--ghost btn--sm" style={{ flex: 1, textAlign: 'center' }}>Details</Link>
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(game.id, game.title)}>Löschen</button>
              </div>
            </div>
          ))}
          {filteredGames.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Keine Spiele in dieser Kategorie gefunden.</p>
          )}
        </div>
      </section>

      {!activeGenre && freeGames.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Free to Play</h2>
          </div>
          <div className="games-grid stagger">
            {freeGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </section>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Neues Spiel erstellen">
        <form onSubmit={handleSubmit}>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label>Titel *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="z.B. The Witcher 3" />
          </div>
          <div className="form-group">
            <label>Beschreibung *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Spielbeschreibung..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preis (€)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Release-Datum</label>
              <input value={form.release_date} onChange={e => setForm({ ...form, release_date: e.target.value })} placeholder="z.B. 2023-06-15" />
            </div>
          </div>
          <div className="form-group">
            <label>Publisher</label>
            <select value={form.publisher_id} onChange={e => setForm({ ...form, publisher_id: e.target.value })}>
              <option value="">Publisher wählen...</option>
              {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option value="NEW">+ Neuen Publisher hinzufügen...</option>
            </select>
          </div>
          {form.publisher_id === 'NEW' && (
            <div className="form-group animate-fadeIn" style={{ background: 'rgba(184, 149, 108, 0.05)', padding: '1rem', borderLeft: '3px solid var(--accent-primary)', borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0' }}>
              <label style={{ color: 'var(--accent-primary)' }}>Name des neuen Publishers *</label>
              <input value={form.newPublisherName} onChange={e => setForm({ ...form, newPublisherName: e.target.value })} placeholder="z.B. Devolver Digital" />
            </div>
          )}
          <div className="form-group">
            <label>Cover-URL</label>
            <input value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Plattformen (kommagetrennt)</label>
              <input value={form.platforms} onChange={e => setForm({ ...form, platforms: e.target.value })} placeholder="PC, PS5, Xbox" />
            </div>
            <div className="form-group">
              <label>Tags (kommagetrennt)</label>
              <input value={form.tag_names} onChange={e => setForm({ ...form, tag_names: e.target.value })} placeholder="Action, RPG, Open World" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Abbrechen</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Speichern...' : 'Erstellen'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default HomePage
