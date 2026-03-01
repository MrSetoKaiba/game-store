import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'
import FeaturedCarousel from '../components/FeaturedCarousel'
import Modal from '../components/Modal'
import { useApp } from '../AppContext'
import { getGames, createGame, deleteGame, getPublishers, createPublisher } from '../api'

const emptyForm = { title: '', description: '', price: '', release_date: '', publisher_id: '', newPublisherName: '', cover_url: '', platforms: [], tag_names: [] }

function HomePage() {
  const { activeGenre, setActiveGenre, activePublisher, setActivePublisher, searchQuery, isAdmin } = useApp()
  const [games, setGames] = useState([])
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState(null)

  const handleDateChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, ''); // get only digits
    if (val.length === 8) {
      val = `${val.substring(0, 2)}.${val.substring(2, 4)}.${val.substring(4)}`;
    } else {
      val = e.target.value;
    }
    setForm({ ...form, release_date: val });
  };

  const load = () => {
    setLoading(true)
    Promise.all([getGames(), getPublishers()])
      .then(([g, p]) => {
        const pubMap = Object.fromEntries(p.map(pub => [pub.id, pub.name]))
        const enrichedGames = g.map(game => ({
          ...game,
          publisher: pubMap[game.publisher_id]
        }))
        setGames(enrichedGames)
        setPublishers(p)
      })
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
        platforms: form.platforms || [],
        tag_names: form.tag_names || []
      }
      await createGame(data)
      setModalOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDeleteClick = (gameId, title) => {
    setGameToDelete({ id: gameId, title });
    setDeleteModalOpen(true);
  }

  const confirmDelete = async () => {
    if (!gameToDelete) return;
    try {
      await deleteGame(gameToDelete.id)
      setDeleteModalOpen(false)
      setGameToDelete(null)
      load()
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div className="loading-state">Spiele werden geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>

  // Helper: parse release date to a JS Date
  const parseReleaseDate = (dateStr) => {
    if (!dateStr) return null;
    // DD.MM.YYYY format
    const euMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (euMatch) return new Date(parseInt(euMatch[3]), parseInt(euMatch[2]) - 1, parseInt(euMatch[1]));
    // YYYY-MM-DD format
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    return null;
  }

  const now = new Date()

  // Filter by active genre, active publisher and search query
  const filteredGames = games.filter(g => {
    // Special filters
    if (activeGenre === 'Free to Play') return g.price === 0
    if (activeGenre === 'Pre-Order') {
      const rd = parseReleaseDate(g.release_date)
      return rd && rd > now
    }
    const matchesGenre = activeGenre ? (g.tag_names && g.tag_names.includes(activeGenre)) : true
    const matchesPublisher = activePublisher ? g.publisher === activePublisher : true
    const matchesSearch = searchQuery
      ? (g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
    return matchesGenre && matchesPublisher && matchesSearch
  })

  const freeGames = filteredGames.filter(g => g.price === 0)

  // Define standard tags to match categories from App.jsx exactly
  const standardTags = [
    'Action', 'Adventure', 'Co-op', 'Competitive', 'Fantasy', 'Horror', 'Indie',
    'Open World', 'Platformer', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy',
    'Free to Play', 'Pre-Order'
  ].sort()
  const allAvailableTags = standardTags;

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tag_names: (prev.tag_names || []).includes(tag)
        ? (prev.tag_names || []).filter(t => t !== tag)
        : [...(prev.tag_names || []), tag]
    }))
  }

  const togglePlatform = (plat) => {
    setForm(prev => ({
      ...prev,
      platforms: (prev.platforms || []).includes(plat)
        ? (prev.platforms || []).filter(p => p !== plat)
        : [...(prev.platforms || []), plat]
    }))
  }

  // Shuffle games to get random ones for the carousel
  const shuffledGames = [...games].sort(() => 0.5 - Math.random())

  return (
    <div className="animate-fadeIn">
      {!activeGenre && !activePublisher && <FeaturedCarousel games={shuffledGames} />}

      {(activeGenre || activePublisher) && (
        <div className="genre-filter-banner" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', background: 'var(--bg-dark)', borderRadius: 'var(--border-radius-lg)', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Filter: {activeGenre || activePublisher}</h2>
          <span style={{ color: 'var(--text-muted)' }}>{filteredGames.length} Spiele gefunden</span>
          <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={() => { setActiveGenre(null); setActivePublisher(null); }}>✕ Filter entfernen</button>
        </div>
      )}

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{(activeGenre || activePublisher) ? `${activeGenre || activePublisher} Spiele` : 'Alle Spiele'}</h2>
          {isAdmin && <button className="btn btn--primary btn--sm" onClick={openCreate}>+ Neues Spiel</button>}
        </div>
        <div className="games-grid stagger">
          {filteredGames.map(game => (
            <div key={game.id} style={{ position: 'relative' }}>
              <GameCard game={game} />
              <div className="card-actions">
                <Link to={`/games/${game.id}`} className="btn btn--ghost btn--sm" style={{ flex: 1, textAlign: 'center' }}>Details</Link>
                {isAdmin && <button className="btn btn--ghost btn--sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => handleDeleteClick(game.id, game.title)}>Löschen</button>}
              </div>
            </div>
          ))}
          {filteredGames.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Keine Spiele in dieser Kategorie gefunden.</p>
          )}
        </div>
      </section>

      {!activeGenre && !activePublisher && freeGames.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Free to Play</h2>
          </div>
          <div className="games-grid stagger">
            {freeGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </section>
      )}

      {!activeGenre && !activePublisher && (() => {
        const preOrderGames = games.filter(g => {
          const rd = parseReleaseDate(g.release_date)
          return rd && rd > now
        })
        return preOrderGames.length > 0 ? (
          <section className="section">
            <div className="section__header">
              <h2 className="section__title">Coming Soon / Pre-Order</h2>
            </div>
            <div className="games-grid stagger">
              {preOrderGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>
        ) : null
      })()}

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
              <input value={form.release_date} onChange={handleDateChange} placeholder="z.B. 19.11.2026" />
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
              <label>Plattformen</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['PC', 'PS5', 'Xbox', 'Switch'].map(plat => (
                  <button
                    key={plat}
                    type="button"
                    className="game-details__tag"
                    style={{
                      background: (form.platforms || []).includes(plat) ? 'var(--accent-primary)' : 'var(--bg-light)',
                      color: (form.platforms || []).includes(plat) ? 'var(--bg-darkest)' : 'var(--text-secondary)',
                      fontWeight: (form.platforms || []).includes(plat) ? '600' : '400',
                      border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem'
                    }}
                    onClick={() => togglePlatform(plat)}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {allAvailableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="game-details__tag"
                    style={{
                      background: (form.tag_names || []).includes(tag) ? 'var(--accent-primary)' : 'var(--bg-light)',
                      color: (form.tag_names || []).includes(tag) ? 'var(--bg-darkest)' : 'var(--text-secondary)',
                      fontWeight: (form.tag_names || []).includes(tag) ? '600' : '400',
                      border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem'
                    }}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Abbrechen</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Speichern...' : 'Erstellen'}</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Spiel löschen">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Möchtest du <strong>{gameToDelete?.title}</strong> wirklich löschen?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn--ghost" onClick={() => setDeleteModalOpen(false)}>Abbrechen</button>
            <button className="btn btn--primary" onClick={confirmDelete}>Ja, löschen</button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default HomePage
