import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGame, getGames, updateGame, deleteGame, getPublishers } from '../api'
import { useApp } from '../AppContext'
import Modal from '../components/Modal'
import GiftIcon from '../components/GiftIcon'

function GameDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist, setActiveGenre, setActivePublisher, isAdmin, isPurchased } = useApp()
  const [game, setGame] = useState(null)
  const [allAvailableTags, setAllAvailableTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ tag_names: [] })
  const [formError, setFormError] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const formatDateEuropean = (dateStr) => {
    if (!dateStr) return '';
    // If it's already DD.MM.YYYY, return it
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
    // If it's YYYYMMDD
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.substring(6, 8)}.${dateStr.substring(4, 6)}.${dateStr.substring(0, 4)}`;
    }
    // If it's YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}.${m}.${y}`;
    }
    return dateStr;
  };

  const handleDateChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length === 8) {
      val = `${val.substring(0, 2)}.${val.substring(2, 4)}.${val.substring(4)}`;
    } else {
      val = e.target.value;
    }
    setForm({ ...form, release_date: val });
  };

  const [saving, setSaving] = useState(false)
  const [added, setAdded] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getGame(id), getPublishers()])
      .then(([g, p]) => {
        const pubMap = Object.fromEntries(p.map(pub => [pub.id, pub.name]))
        g.publisherName = pubMap[g.publisher_id]
        setGame(g)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  // Load standard tags to match categories from App.jsx exactly
  useEffect(() => {
    const standardTags = [
      'Action', 'Adventure', 'Co-op', 'Competitive', 'Fantasy', 'Horror', 'Indie',
      'Open World', 'Platformer', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy',
      'Free to Play', 'Pre-Order'
    ].sort();
    setAllAvailableTags(standardTags);
  }, [])

  const openEdit = () => {
    setForm({
      title: game.title || '',
      description: game.description || '',
      price: game.price != null ? game.price : '',
      release_date: formatDateEuropean(game.release_date || ''),
      cover_url: game.cover_url || '',
      platforms: game.platforms || [],
      tag_names: game.tag_names || []
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
        platforms: form.platforms || [],
        tag_names: form.tag_names || []
      }
      await updateGame(id, data)
      setEditOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try {
      await deleteGame(id)
      setDeleteModalOpen(false)
      navigate('/')
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async () => {
    setDeleteModalOpen(true)
  }

  const handleAddToCart = () => {
    if (isFree && isPurchased(game.id)) {
      setIsStarting(true)
      setTimeout(() => setIsStarting(false), 2000)
    } else {
      addToCart(game)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleTagClick = (tag) => {
    setActiveGenre(tag)
    navigate('/')
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
  const isPreOrder = (() => {
    if (!game.release_date) return false;
    const euMatch = game.release_date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (euMatch) return new Date(parseInt(euMatch[3]), parseInt(euMatch[2]) - 1, parseInt(euMatch[1])) > new Date();
    const isoMatch = game.release_date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])) > new Date();
    return false;
  })()

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
            {/* <span className="game-details__publisher-link">{game.publisher_id || 'Unbekannter Publisher'}</span> */}
            <div className="game-details__price-box">
              <span className="game-details__price">
                {isFree ? 'Free to Play' : `${game.price.toFixed(2)} €`}
              </span>
            </div>
            <div className="game-details__buttons">
              {isPurchased(game.id) && !isFree ? (
                <button className="btn btn--secondary btn--lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem' }} disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Gekauft</span>
                </button>
              ) : alreadyInCart ? (
                <button className="btn btn--secondary btn--lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem' }} disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Im Warenkorb</span>
                </button>
              ) : added ? (
                <button className="btn btn--success btn--lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem' }} disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Hinzugefügt!</span>
                </button>
              ) : isStarting ? (
                <button className="btn btn--primary btn--lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem' }} disabled>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  <span>Wird gestartet...</span>
                </button>
              ) : (
                <button className="btn btn--success btn--lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem' }} onClick={handleAddToCart}>
                  {(isFree && isPurchased(game.id)) ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  )}
                  <span>{(isFree && isPurchased(game.id)) ? 'Spielen' : isPreOrder ? 'Vorbestellen' : 'In den Warenkorb'}</span>
                </button>
              )}
              <button
                className="btn btn--ghost"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem', marginTop: '0.5rem' }}
                onClick={handleWishlist}
              >
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiftIcon filled={isInWishlist(game.id)} style={{ width: '18px', height: '18px' }} />
                </div>
                <span>{isInWishlist(game.id) ? 'Auf Wunschliste' : 'Wunschliste'}</span>
              </button>
              {isAdmin && (
                <>
                  <button className="btn btn--ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem', marginTop: '1rem' }} onClick={openEdit}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span>Bearbeiten</span>
                  </button>
                  <button className="btn btn--ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.75rem', paddingLeft: '2.5rem', marginTop: '0.5rem' }} onClick={handleDelete}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span>Spiel löschen</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="game-details__info-card">
            <h4>Spieldetails</h4>
            {game.publisherName && (
              <div className="game-details__info-row">
                <span className="game-details__info-label">Publisher</span>
                <span
                  className="game-details__info-value"
                  style={{ cursor: 'pointer', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}
                  onClick={() => { setActivePublisher(game.publisherName); navigate('/'); }}
                >
                  {game.publisherName}
                </span>
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
                <span className="game-details__info-value">{formatDateEuropean(game.release_date)}</span>
              </div>
            )}
            {game.tag_names && game.tag_names.length > 0 && (
              <div className="game-details__tags">
                {game.tag_names.map(tag => (
                  <span
                    key={tag}
                    className="game-details__tag"
                    onClick={() => handleTagClick(tag)}
                    title={`Alle "${tag}" Spiele anzeigen`}
                  >
                    {tag}
                  </span>
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
              <input value={form.release_date} onChange={handleDateChange} placeholder="z.B. 19.11.2026" />
            </div>
          </div>
          <div className="form-group">
            <label>Cover-URL</label>
            <input value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} />
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
                    onClick={() => setForm(prev => ({
                      ...prev,
                      platforms: (prev.platforms || []).includes(plat)
                        ? (prev.platforms || []).filter(p => p !== plat)
                        : [...(prev.platforms || []), plat]
                    }))}
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
                    onClick={() => setForm(prev => ({
                      ...prev,
                      tag_names: (prev.tag_names || []).includes(tag)
                        ? (prev.tag_names || []).filter(t => t !== tag)
                        : [...(prev.tag_names || []), tag]
                    }))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setEditOpen(false)}>Abbrechen</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Spiel löschen">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Möchtest du <strong>{game.title}</strong> wirklich löschen?
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

export default GameDetailsPage
