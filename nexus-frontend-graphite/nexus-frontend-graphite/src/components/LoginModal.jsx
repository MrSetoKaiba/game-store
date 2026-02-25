import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'
import { getUsers } from '../api'

function LoginModal({ isOpen, onClose }) {
    const { loginAs } = useApp()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getUsers()
                .then(setUsers)
                .catch(err => console.error("Fehler beim Laden der Benutzer", err))
                .finally(() => setLoading(false))
        }
    }, [isOpen])

    const handleLogin = (user) => {
        loginAs(user)
        onClose()
    }

    if (!isOpen) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Benutzer wechseln (Admin Panel)">
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                Wähle einen existierenden Account aus der Datenbank aus, um dessen Ansicht zu simulieren.
                (Wenn du neue Rollen wie "Admin" oder "Guest" brauchst, lege diese einfach im Tab "Community" als neuen User an!)
            </p>

            {loading ? (
                <div className="loading-state">Lade Benutzer...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {users.map(u => (
                        <button
                            key={u.id}
                            className="btn btn--secondary"
                            style={{
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onClick={() => handleLogin(u)}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--gradient-accent)',
                                color: 'var(--bg-darkest)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {u.display_name ? u.display_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{u.display_name || u.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                            </div>
                        </button>
                    ))}
                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                            Keine Benutzer gefunden. Erstelle zuerst welche!
                        </div>
                    )}
                </div>
            )}

            <div className="form-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button className="btn btn--ghost" onClick={onClose} style={{ width: '100%' }}>Schließen</button>
            </div>
        </Modal>
    )
}

export default LoginModal
