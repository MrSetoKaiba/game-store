import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="about-hero__content">
                    <h1>Bonfire, Die ultimative Spieleplattform</h1>
                    <p>Bonfire ist der perfekte Ort zum Spielen, Diskutieren und Entdecken von Spielen.</p>
                    <div className="about-hero__actions">
                        <Link to="/" className="btn btn--primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                            Shop durchstöbern
                        </Link>
                    </div>
                </div>
            </div>

            <div className="about-features">
                <div className="about-feature-grid">
                    <div className="about-feature-card">
                        <h3>Spiele sofort zugänglich</h3>
                        <p>
                            Wir bieten tausende Spiele – von Action bis Indie und vielem mehr. Genieße exklusive Angebote, automatische Spielupdates und weitere großartige Vorteile.
                        </p>
                        <Link to="/" className="about-feature-link">Shop durchstöbern »</Link>
                    </div>

                    <div className="about-feature-card">
                        <h3>Trete der Community bei</h3>
                        <p>
                            Finde neue Freunde, trete Gruppen bei, chatte, spiele zusammen und mehr! Mit Millionen von Spielern, die jederzeit online sind, gibt es immer jemanden zum Spielen.
                        </p>
                        <Link to="/users" className="about-feature-link">Community besuchen »</Link>
                    </div>

                    <div className="about-feature-card">
                        <h3>Entdecke Empfehlungen</h3>
                        <p>
                            Basierend auf deinen gespielten Spielen und deiner Wunschliste empfehlen wir dir Titel, die genau zu deinem Geschmack passen.
                        </p>
                        <Link to="/recommendations" className="about-feature-link">Empfehlungen ansehen »</Link>
                    </div>

                    <div className="about-feature-card">
                        <h3>Veröffentliche dein Spiel</h3>
                        <p>
                            Bonfireworks bietet Entwicklern und Publishern die Werkzeuge, die sie benötigen, um ihre Spiele an Millionen von Spielern weltweit zu vertreiben.
                        </p>
                        <Link to="/publishers" className="about-feature-link">Über Publisher erfahren »</Link>
                    </div>
                </div>
            </div>

            <div className="about-details">
                <h2>Features</h2>
                <p className="about-details__intro">Wir arbeiten ständig daran, neue Funktionen bereitzustellen, damit Bonfire noch besser wird.</p>

                <div className="about-details-grid">
                    <div className="about-detail-item">
                        <div className="about-detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div className="about-detail-text">
                            <h4>Bonfire Chat</h4>
                            <p>Sprich mit Freunden oder Gruppen per Text direkt aus Bonfire heraus.</p>
                        </div>
                    </div>
                    <div className="about-detail-item">
                        <div className="about-detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="about-detail-text">
                            <h4>Spiel-Hubs</h4>
                            <p>Alles über dein Spiel an einem Ort: Diskussionen, Reviews und Neuigkeiten.</p>
                        </div>
                    </div>
                    <div className="about-detail-item">
                        <div className="about-detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>
                        <div className="about-detail-text">
                            <h4>Wunschliste und Warenkorb</h4>
                            <p>Behalte Spiele im Auge, die du dir wünschst, und verwalte deinen Einkauf.</p>
                        </div>
                    </div>
                    <div className="about-detail-item">
                        <div className="about-detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        </div>
                        <div className="about-detail-text">
                            <h4>Überall verfügbar</h4>
                            <p>Nutze Bonfire am PC oder unterwegs dank responsivem Design.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
