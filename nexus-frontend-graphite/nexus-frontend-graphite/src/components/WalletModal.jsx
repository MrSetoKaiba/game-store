import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'
import { Link } from 'react-router-dom'

function WalletModal({ isOpen, onClose }) {
    const { currentUser, addFunds } = useApp()
    const [code, setCode] = useState('')

    if (!currentUser) return null

    const handleQuickAdd = (amount) => {
        addFunds(amount)
        alert(`${amount} € wurden gutgeschrieben!`)
    }

    const handleRedeemCode = (e) => {
        e.preventDefault()
        if (code.trim().length > 0) {
            // Mock code logic
            if (code === 'BONFIRE2024') {
                addFunds(20)
                alert('Code eingelöst! 20 € gutgeschrieben.')
            } else {
                alert('Code erfolgreich eingelöst! (Simulation)')
                addFunds(5)
            }
            setCode('')
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mein Guthaben">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Aktuelles Guthaben</span>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    {currentUser.wallet_balance.toFixed(2)} €
                </div>
            </div>

            <div className="section" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Guthaben aufladen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[10, 15, 25, 50, 100].map(amount => (
                        <button
                            key={amount}
                            className="btn btn--ghost"
                            onClick={() => handleQuickAdd(amount)}
                            style={{
                                flexDirection: 'column',
                                padding: '1rem 0.5rem',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{amount} €</span>
                        </button>
                    ))}
                </div>

                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Code einlösen</h3>
                <form onSubmit={handleRedeemCode} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        placeholder="Gutscheincode eingeben..."
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn--primary">Einlösen</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Zahlungsmethode</label>
                        <select style={{ width: '100%' }}>
                            <option>💳 Visa endend auf 4242</option>
                            <option>💳 MasterCard endend auf 8899</option>
                            <option>🅿️ PayPal (willi@example.com)</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/profile" className="btn btn--secondary" onClick={onClose}>
                        👤 Profil & Einstellungen
                    </Link>
                    <button className="btn btn--ghost" onClick={onClose}>Schließen</button>
                </div>
            </div>
        </Modal>
    )
}

export default WalletModal
