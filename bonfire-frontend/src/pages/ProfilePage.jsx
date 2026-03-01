import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginModal from '../components/LoginModal'
import Modal from '../components/Modal'
import { getPurchases, getGames } from '../api'

function ProfilePage() {
    const { currentUser, updateUser, addFunds, logout, isAdmin } = useApp()
    const navigate = useNavigate()
    const location = useLocation()
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [logoutModalOpen, setLogoutModalOpen] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [successModalTitle, setSuccessModalTitle] = useState('')
    const [successModalText, setSuccessModalText] = useState('')

    const showSuccess = (title, text) => {
        setSuccessModalTitle(title)
        setSuccessModalText(text)
        setSuccessModalOpen(true)
    }

    const [activeTab, setActiveTab] = useState(location.state?.tab || 'general')
    const [nameForm, setNameForm] = useState({
        display_name: currentUser?.display_name || '',
        email: currentUser?.email || '',
        avatar_url: currentUser?.avatar_url || ''
    })
    const [addressForm, setAddressForm] = useState({ ...currentUser?.address })
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
    const [fundsAmount, setFundsAmount] = useState('')
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, name: 'Visa endend auf 4242' }
    ])
    const [purchaseHistory, setPurchaseHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
        if (currentUser && activeTab === 'history') {
            setHistoryLoading(true)
            Promise.all([getPurchases(1000), getGames(1000)]).then(([purchases, games]) => {
                const userPurchases = purchases.filter(p => p.user_id === currentUser.id)
                const formatted = userPurchases.map(p => {
                    const game = games.find(g => g.id === p.game_id)
                    return {
                        id: p.id || Math.random().toString(36).substring(2, 10).toUpperCase(),
                        date: p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : new Date().toLocaleDateString(),
                        items: [game ? game.title : 'Unbekanntes Spiel'],
                        total: p.price_paid || 0,
                        status: 'Abgeschlossen'
                    }
                })
                setPurchaseHistory(formatted.reverse())
            }).catch(err => console.error("Fehler beim Laden der History", err))
                .finally(() => setHistoryLoading(false))
        }
    }, [currentUser, activeTab])

    if (!currentUser) {
        return (
            <div className="section" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Nicht angemeldet</h2>
                <button className="btn btn--primary" onClick={() => navigate('/')}>Zurück zum Shop</button>
            </div>
        )
    }

    const handleSaveGeneral = (e) => {
        e.preventDefault()
        updateUser(nameForm)
        showSuccess('Profil aktualisiert', 'Deine Profildaten wurden erfolgreich aktualisiert.')
    }

    const handleSaveAddress = (e) => {
        e.preventDefault()
        updateUser({ address: addressForm })
        showSuccess('Adresse gespeichert', 'Deine Adresse wurde erfolgreich hinterlegt.')
    }

    const handleChangePassword = (e) => {
        e.preventDefault()
        if (passwordForm.new !== passwordForm.confirm) {
            alert('Passwörter stimmen nicht überein!')
            return
        }
        showSuccess('Sicherheit', 'Passwort erfolgreich geändert! (Simulation)')
        setPasswordForm({ current: '', new: '', confirm: '' })
    }

    const handleAddFunds = (e) => {
        e.preventDefault()
        const amount = parseFloat(fundsAmount)
        if (amount > 0) {
            addFunds(amount)
            setFundsAmount('')
            showSuccess('Guthaben aufgeladen', `${amount.toFixed(2)} € wurden erfolgreich auf dein Konto geladen.`)
        }
    }

    const handleAddPaymentMethod = () => {
        const newMethod = prompt('Bitte trage eine Zahlungsmethode ein (z.B. PayPal, MasterCard):')
        if (newMethod && newMethod.trim() !== '') {
            setPaymentMethods([...paymentMethods, { id: Date.now(), name: newMethod }])
            showSuccess('Zahlungsmethode', 'Zahlungsmethode erfolgreich hinzugefügt! (Simulation)')
        }
    }

    const handleRemovePaymentMethod = (id) => {
        if (confirm('Diese Zahlungsmethode wirklich entfernen?')) {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
        }
    }

    const handleLogout = () => {
        setLogoutModalOpen(true)
    }

    const confirmLogout = () => {
        logout()
        setLogoutModalOpen(false)
        navigate('/')
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div className="profile-avatar-large" style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        overflow: 'hidden', border: '3px solid var(--accent-primary)',
                        background: 'var(--bg-dark)'
                    }}>
                        {currentUser.avatar_url ? (
                            <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-dim)' }}>
                                {currentUser.display_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h1 className="page-header__title" style={{ marginBottom: 0 }}>{currentUser.display_name}</h1>
                            {isAdmin && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.25rem 0.75rem', borderRadius: '4px',
                                    background: 'linear-gradient(135deg, rgba(184,149,108,0.25), rgba(184,149,108,0.1))',
                                    border: '1px solid rgba(184,149,108,0.4)',
                                    color: 'var(--accent-primary)', fontSize: '0.7rem',
                                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em'
                                }}>
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="page-header__subtitle">{currentUser.email}</p>
                        <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            Guthaben: {currentUser.wallet_balance.toFixed(2)} €
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                    {['general', 'address', 'wallet', 'history', 'security'].map(tab => (
                        <button
                            key={tab}
                            className={`btn btn--ghost ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : 'none',
                                borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                                opacity: activeTab === tab ? 1 : 0.7
                            }}
                        >
                            {tab === 'general' && 'Allgemein'}
                            {tab === 'address' && 'Adresse'}
                            {tab === 'wallet' && 'Guthaben & Zahlung'}
                            {tab === 'history' && 'Kaufhistorie'}
                            {tab === 'security' && 'Sicherheit'}
                        </button>
                    ))}
                </div>

                {activeTab === 'general' && (
                    <form onSubmit={handleSaveGeneral} style={{ maxWidth: '600px' }}>
                        <div className="form-group">
                            <label>Anzeigename</label>
                            <input
                                value={nameForm.display_name}
                                onChange={e => setNameForm({ ...nameForm, display_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={nameForm.email}
                                onChange={e => setNameForm({ ...nameForm, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Avatar Bild-URL</label>
                            <input
                                value={nameForm.avatar_url}
                                onChange={e => setNameForm({ ...nameForm, avatar_url: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                            <small style={{ color: 'var(--text-dim)' }}>Füge eine Bild-URL ein für deinen Avatar.</small>
                        </div>
                        <button type="submit" className="btn btn--primary">Speichern</button>
                    </form>
                )}

                {activeTab === 'address' && (
                    <form onSubmit={handleSaveAddress} style={{ maxWidth: '600px' }}>
                        <div className="form-group">
                            <label>Straße & Hausnummer</label>
                            <input
                                value={addressForm.street}
                                onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>PLZ</label>
                                <input
                                    value={addressForm.zip}
                                    onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Stadt</label>
                                <input
                                    value={addressForm.city}
                                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Land</label>
                            <input
                                value={addressForm.country}
                                onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn--primary">Adresse Speichern</button>
                    </form>
                )}

                {activeTab === 'wallet' && (
                    <div style={{ maxWidth: '600px' }}>
                        <div className="form-group" style={{ border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-dark)' }}>
                            <label style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'block', color: 'var(--text-primary)', fontWeight: '600' }}>Guthaben aufladen</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    placeholder="Betrag in €"
                                    value={fundsAmount}
                                    onChange={e => setFundsAmount(e.target.value)}
                                    min="1"
                                    style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 'var(--border-radius-sm)' }}
                                />
                                <button className="btn btn--primary" onClick={handleAddFunds} style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}>Aufladen</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Gespeicherte Zahlungsmethoden</label>
                            {paymentMethods.length === 0 ? (
                                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>Keine Methoden hinterlegt.</p>
                            ) : (
                                paymentMethods.map(pm => (
                                    <div key={pm.id} style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                            <span>{pm.name}</span>
                                        </div>
                                        <button className="btn btn--ghost btn--sm" onClick={() => handleRemovePaymentMethod(pm.id)}>Entfernen</button>
                                    </div>
                                ))
                            )}
                            <button className="btn btn--ghost btn--sm" onClick={handleAddPaymentMethod}>+ Neue Zahlungsmethode</button>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} style={{ maxWidth: '600px' }}>
                        <div className="form-group">
                            <label>Aktuelles Passwort</label>
                            <input
                                type="password"
                                value={passwordForm.current}
                                onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Neues Passwort</label>
                            <input
                                type="password"
                                value={passwordForm.new}
                                onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Passwort bestätigen</label>
                            <input
                                type="password"
                                value={passwordForm.confirm}
                                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn--primary">Passwort ändern</button>
                    </form>
                )}

                {activeTab === 'history' && (
                    <div style={{ maxWidth: '800px' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Deine letzten Einkäufe</h3>
                        {historyLoading ? (
                            <p style={{ color: 'var(--text-dim)' }}>Lade Kaufhistorie...</p>
                        ) : purchaseHistory.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)' }}>Du hast noch keine Einkäufe getätigt.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {purchaseHistory.map(purchase => (
                                    <div key={purchase.id} style={{
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Datum: </span>
                                                <strong style={{ color: 'var(--text-secondary)' }}>{purchase.date}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Bestell-ID: </span>
                                                <strong style={{ color: 'var(--text-secondary)' }}>{purchase.id}</strong>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                                {purchase.items.map((item, idx) => (
                                                    <li key={idx} style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginRight: '0.5rem' }}>Status:</span>
                                                <span style={{
                                                    color: purchase.status === 'Abgeschlossen' ? 'var(--accent-success)' : 'var(--accent-danger)',
                                                    fontWeight: '600'
                                                }}>{purchase.status}</span>
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                {purchase.total.toFixed(2)} €
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn--ghost" onClick={() => setLoginModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Account wechseln
                </button>
                <button className="btn btn--ghost" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Abmelden
                </button>
            </div>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

            <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Abmelden">
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Möchtest du dich wirklich abmelden?</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn--ghost" onClick={() => setLogoutModalOpen(false)}>Abbrechen</button>
                    <button className="btn btn--ghost" onClick={confirmLogout}>Ja, abmelden</button>
                </div>
            </Modal>

            <Modal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} title="Erfolgreich">
                <div style={{ textAlign: 'center', padding: '1rem 2rem' }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--accent-success)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{successModalTitle}</h3>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>{successModalText}</p>
                    <button className="btn btn--primary" onClick={() => setSuccessModalOpen(false)}>Schließen</button>
                </div>
            </Modal>
        </div>
    )
}

export default ProfilePage
