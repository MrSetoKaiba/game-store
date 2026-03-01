import { useState, useEffect } from 'react'
import { getPublishers, createPublisher, updatePublisher, deletePublisher } from '../api'
import Modal from '../components/Modal'
import { useApp } from '../AppContext'

const emptyForm = { name: '', description: '', website: '', founded_year: '', country: '' }

function PublishersPage() {
  const { isAdmin } = useApp()
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getPublishers()
      .then(setPublishers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(null); setModalOpen(true) }
  const openEdit = (pub) => {
    setEditing(pub)
    setForm({ name: pub.name || '', description: pub.description || '', website: pub.website || '', founded_year: pub.founded_year || '', country: pub.country || '' })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Name ist Pflichtfeld'); return }
    setSaving(true); setFormError(null)
    try {
      const data = { ...form, founded_year: form.founded_year ? parseInt(form.founded_year) : null }
      if (editing) {
        await updatePublisher(editing.id, data)
      } else {
        await createPublisher(data)
      }
      setModalOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (pub) => {
    if (!confirm(`"${pub.name}" wirklich löschen?`)) return
    try {
      await deletePublisher(pub.id)
      load()
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div className="loading-state">Publisher werden geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-header__title">Publisher</h1>
        <p className="page-header__subtitle">Entdecke {publishers.length} Spieleentwickler</p>
        <div className="page-header__actions">
          {isAdmin && <button className="btn btn--primary" onClick={openCreate}>+ Neuer Publisher</button>}
        </div>
      </div>

      <div className="publishers-grid stagger">
        {publishers.map(pub => (
          <div key={pub.id} className="publisher-card">
            <div className="publisher-card__header">
              <div className="publisher-card__logo">{pub.name.charAt(0)}</div>
              <div>
                <h3 className="publisher-card__name">{pub.name}</h3>
                <p className="publisher-card__country">{pub.country || 'Unbekannt'}</p>
              </div>
            </div>
            <div className="publisher-card__footer">
              {pub.founded_year && <span className="publisher-card__stat">Seit <span>{pub.founded_year}</span></span>}
              {pub.website && <a href={pub.website} target="_blank" rel="noopener noreferrer" className="publisher-card__stat">Website</a>}
            </div>
            {isAdmin && (
              <div className="card-actions">
                <button className="btn btn--ghost btn--sm" onClick={() => openEdit(pub)}>Bearbeiten</button>
                <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(pub)}>Löschen</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Publisher bearbeiten' : 'Neuer Publisher'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label>Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. CD Projekt Red" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Land</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="z.B. Polen" />
            </div>
            <div className="form-group">
              <label>Gründungsjahr</label>
              <input type="number" value={form.founded_year} onChange={e => setForm({ ...form, founded_year: e.target.value })} placeholder="z.B. 1994" />
            </div>
          </div>
          <div className="form-group">
            <label>Website</label>
            <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Kurzbeschreibung..." />
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

export default PublishersPage
