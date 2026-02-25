import { useState } from 'react'
import { useApp } from '../AppContext'
import { useNavigate } from 'react-router-dom'
import LoginModal from '../components/LoginModal'

function ProfilePage() {
    const { currentUser, updateUser, addFunds, logout } = useApp()
    const navigate = useNavigate()
    const [loginModalOpen, setLoginModalOpen] = useState(false)

    const [activeTab, setActiveTab] = useState('general')
    const [nameForm, setNameForm] = useState({
        display_name: currentUser?.display_name || '',
        email: currentUser?.email || '',
        avatar_url: currentUser?.avatar_url || ''
    })
    const [addressForm, setAddressForm] = useState({ ...currentUser?.address })
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
    const [fundsAmount, setFundsAmount] = useState('')
    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, name: '💳 Visa endend auf 4242' }
    ])

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
        alert('Profil aktualisiert!')
    }

    const handleSaveAddress = (e) => {
        e.preventDefault()
        updateUser({ address: addressForm })
        alert('Adresse gespeichert!')
    }

    const handleChangePassword = (e) => {
        e.preventDefault()
        if (passwordForm.new !== passwordForm.confirm) {
            alert('Passwörter stimmen nicht überein!')
            return
        }
        alert('Passwort erfolgreich geändert! (Simulation)')
        setPasswordForm({ current: '', new: '', confirm: '' })
    }

    const handleAddFunds = (e) => {
        e.preventDefault()
        const amount = parseFloat(fundsAmount)
        if (amount > 0) {
            addFunds(amount)
            setFundsAmount('')
            alert(`${amount.toFixed(2)} € gutgeschrieben!`)
        }
    }

    const handleAddPaymentMethod = () => {
        const newMethod = prompt('Bitte trage eine Zahlungsmethode ein (z.B. PayPal, MasterCard):')
        if (newMethod && newMethod.trim() !== '') {
            setPaymentMethods([...paymentMethods, { id: Date.now(), name: `💳 ${newMethod}` }])
            alert('Zahlungsmethode erfolgreich hinzugefügt! (Simulation)')
        }
    }

    const handleRemovePaymentMethod = (id) => {
        if (confirm('Diese Zahlungsmethode wirklich entfernen?')) {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
        }
    }

    const handleLogout = () => {
        if (confirm('Wirklich abmelden?')) {
            logout()
            navigate('/')
        }
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
                        <h1 className="page-header__title" style={{ marginBottom: '0.5rem' }}>{currentUser.display_name}</h1>
                        <p className="page-header__subtitle">{currentUser.email}</p>
                        <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            Guthaben: {currentUser.wallet_balance.toFixed(2)} €
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                    {['general', 'address', 'wallet', 'security'].map(tab => (
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
                        <div className="form-group" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
                            <label style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'block' }}>Guthaben aufladen</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="number"
                                    placeholder="Betrag in €"
                                    value={fundsAmount}
                                    onChange={e => setFundsAmount(e.target.value)}
                                    min="1"
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn--success" onClick={handleAddFunds}>Aufladen</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Gespeicherte Zahlungsmethoden</label>
                            {paymentMethods.length === 0 ? (
                                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>Keine Methoden hinterlegt.</p>
                            ) : (
                                paymentMethods.map(pm => (
                                    <div key={pm.id} style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{pm.name}</span>
                                        <button className="btn btn--danger btn--sm" onClick={() => handleRemovePaymentMethod(pm.id)}>Entfernen</button>
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
            </div>

            <div className="section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn--ghost" onClick={() => setLoginModalOpen(true)}>👥 Account wechseln</button>
                <button className="btn btn--danger" onClick={handleLogout}>🚪 Abmelden</button>
            </div>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </div>
    )
}

export default ProfilePage
