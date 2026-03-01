import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../api';

function SupportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [games, setGames] = useState([]);

    useEffect(() => {
        getGames().then(setGames).catch(console.error);
    }, []);

    const filteredGames = searchTerm.length > 0
        ? games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="support-page">
            <div className="support-header">
                <div className="support-header__content">
                    <h1>Bonfire Support</h1>
                    <p>Womit können wir dir heute helfen?</p>

                    <div className="support-search" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Suche nach einem Problem, Spiel oder einer Support-Anfrage..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={searchTerm.length > 0 ? {
                                borderBottomLeftRadius: '0',
                                borderBottomRightRadius: '0',
                                borderBottomColor: 'transparent',
                            } : {}}
                        />
                        <button className="support-search-btn" style={searchTerm.length > 0 ? { color: 'var(--accent-primary)' } : {}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>

                        {searchTerm.length > 0 && (
                            <div className="support-search-results animate-fadeIn" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'var(--bg-darker)',
                                border: '2px solid var(--accent-primary)',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '0 0 24px 24px',
                                zIndex: 10,
                                marginTop: '-2px',
                                maxHeight: '350px', overflowY: 'auto',
                                boxShadow: 'var(--shadow-glow)'
                            }}>
                                {filteredGames.length > 0 ? (
                                    filteredGames.map(game => (
                                        <Link key={game.id} to={`/games/${game.id}`} style={{
                                            display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px',
                                            textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'background 0.2s'
                                        }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <img src={game.cover_url} alt={game.title} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '2px' }}>{game.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Produktsupport aufrufen</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Keine passenden Produkte gefunden.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="support-content">
                <div className="support-section">
                    <h2>Häufige Anliegen</h2>
                    <div className="support-grid">
                        <Link to="/profile" state={{ tab: 'history' }} className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                            </div>
                            <div className="support-card__text">Käufe</div>
                            <div className="support-card__desc">Probleme mit Zahlungen, fehlenden Spielen oder Rückerstattungen</div>
                        </Link>

                        <Link to="/" className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
                            </div>
                            <div className="support-card__text">Spiele, Software, etc.</div>
                            <div className="support-card__desc">Abstürze, Fehler oder andere technische Probleme mit Produkten</div>
                        </Link>

                        <Link to="/profile" className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div className="support-card__text">Mein Account</div>
                            <div className="support-card__desc">Passwort vergessen, Anmeldung nicht möglich oder Account-Sicherheit</div>
                        </Link>

                        <Link to="#" className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                            </div>
                            <div className="support-card__text">Handel und Geschenke</div>
                            <div className="support-card__desc">Fragen zu Inventargegenständen oder verschickten Geschenken</div>
                        </Link>

                        <Link to="#" className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                            </div>
                            <div className="support-card__text">Bonfire Client</div>
                            <div className="support-card__desc">Verbindungsabbrüche, langsame Downloads oder Client-Fehler</div>
                        </Link>

                        <Link to="/users" className="support-card">
                            <div className="support-card__icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <div className="support-card__text">Community und Richtlinien</div>
                            <div className="support-card__desc">Verwarnungen, Banns oder das Melden von Spielern</div>
                        </Link>
                    </div>
                </div>

                <div className="support-contact">
                    <h3>Nichts gefunden?</h3>
                    <p>Unser Support-Team steht für dich bereit, wenn du spezifische Hilfe brauchst.</p>
                    <button className="btn btn--primary">Support-Ticket erstellen</button>
                </div>
            </div>
        </div>
    );
}

export default SupportPage;
