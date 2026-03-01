import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'
import { Link } from 'react-router-dom'

function WalletModal({ isOpen, onClose }) {
    const { currentUser, addFunds } = useApp()
    const [code, setCode] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    if (!currentUser) return null

    const handleQuickAdd = (amount) => {
        addFunds(amount)
        setSuccessMessage(`${amount.toFixed(2)} € wurden erfolgreich auf dein Konto geladen.`)
    }

    const handleRedeemCode = (e) => {
        e.preventDefault()
        if (code.trim().length > 0) {
            // Mock code logic
            if (code === 'BONFIRE2024') {
                addFunds(20)
                setSuccessMessage('Code "BONFIRE2024" eingelöst! 20.00 € wurden gutgeschrieben.')
            } else {
                addFunds(5)
                setSuccessMessage(`Code erfolgreich eingelöst! 5.00 € wurden gutgeschrieben.`)
            }
            setCode('')
        }
    }

    return (
        <>
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
                    <form onSubmit={handleRedeemCode} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            placeholder="Gutscheincode eingeben..."
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--border-radius-sm)' }}
                        />
                        <button type="submit" className="btn btn--primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}>Einlösen</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Zahlungsmethode</label>
                            <select style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)' }}>
                                <option>Visa endend auf 4242</option>
                                <option>MasterCard endend auf 8899</option>
                                <option>PayPal (willi@example.com)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/profile" className="btn btn--secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Profil & Einstellungen
                        </Link>
                        <button className="btn btn--ghost" onClick={onClose}>Schließen</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!successMessage} onClose={() => setSuccessMessage('')} title="Guthaben aufgeladen">
                <div style={{ textAlign: 'center', padding: '1rem 2rem' }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--accent-success)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Transaktion erfolgreich</h3>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>{successMessage}</p>
                    <button className="btn btn--primary" onClick={() => setSuccessMessage('')}>Schließen</button>
                </div>
            </Modal>
        </>
    )
}

export default WalletModal
