import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api'
import Modal from '../components/Modal'

const emptyForm = { username: '', email: '', display_name: '', wallet_balance: '' }

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(null); setModalOpen(true) }
  const openEdit = (user) => {
    setEditing(user)
    setForm({
      username: user.username || '',
      email: user.email || '',
      display_name: user.display_name || '',
      wallet_balance: user.wallet_balance != null ? user.wallet_balance : ''
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.email.trim()) { setFormError('Username und Email sind Pflichtfelder'); return }
    setSaving(true); setFormError(null)
    try {
      const data = {
        ...form,
        wallet_balance: form.wallet_balance !== '' ? parseFloat(form.wallet_balance) : 0
      }
      if (editing) {
        await updateUser(editing.id, data)
      } else {
        await createUser(data)
      }
      setModalOpen(false)
      load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (user) => {
    if (!confirm(`User "${user.display_name || user.username}" wirklich löschen?`)) return
    try {
      await deleteUser(user.id)
      load()
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div className="loading-state">User werden geladen...</div>
  if (error) return <div className="error-state">Fehler: {error}</div>

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-header__title">Community</h1>
        <p className="page-header__subtitle">{users.length} Spieler in unserer Community</p>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openCreate}>+ Neuer User</button>
        </div>
      </div>

      <div className="users-grid stagger">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card__avatar">
              {(user.display_name || user.username || '?').charAt(0)}
            </div>
            <h3 className="user-card__name">{user.display_name || user.username}</h3>
            <p className="user-card__username">@{user.username}</p>
            <div className="user-card__stats">
              <div>
                <div className="user-card__stat-value">
                  {user.wallet_balance != null ? `${user.wallet_balance.toFixed(2)} €` : '—'}
                </div>
                <div className="user-card__stat-label">Guthaben</div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn--ghost btn--sm" onClick={() => openEdit(user)}>Bearbeiten</button>
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(user)}>Löschen</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'User bearbeiten' : 'Neuer User'}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="z.B. pixel_paul" />
            </div>
            <div className="form-group">
              <label>Anzeigename</label>
              <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="z.B. Pixel Paul" />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
          </div>
          <div className="form-group">
            <label>Guthaben (€)</label>
            <input type="number" step="0.01" min="0" value={form.wallet_balance} onChange={e => setForm({ ...form, wallet_balance: e.target.value })} placeholder="0.00" />
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

export default UsersPage
