import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './AppContext'
import HomePage from './pages/HomePage'
import GameDetailsPage from './pages/GameDetailsPage'
import PublishersPage from './pages/PublishersPage'
import UsersPage from './pages/UsersPage'
import ReviewsPage from './pages/ReviewsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ProfilePage from './pages/ProfilePage'
import CartModal from './components/CartModal'
import WalletModal from './components/WalletModal'
import WishlistModal from './components/WishlistModal'
import LoginModal from './components/LoginModal'
import GiftIcon from './components/GiftIcon'
import AboutPage from './pages/AboutPage'
import SupportPage from './pages/SupportPage'
import { getGames } from './api'

function AppInner() {
  const { activeGenre, setActiveGenre, activePublisher, setActivePublisher, cart, wishlist, unseenWishlistCount, clearUnseenWishlist, searchQuery, setSearchQuery, currentUser } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [allTags, setAllTags] = useState([])

  const unifiedTags = [
    'Action', 'Adventure', 'Co-op', 'Competitive', 'Fantasy', 'Horror', 'Indie',
    'Open World', 'Platformer', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy'
  ].sort()

  // Always show strictly these categories in the dropdown
  useEffect(() => {
    setAllTags(unifiedTags)
  }, [])

  const handleGenreClick = (tag) => {
    setActiveGenre(prev => prev === tag ? null : tag)
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand" onClick={() => { setActiveGenre(null); setActivePublisher(null); setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="navbar__brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C10.343 19 9 17.657 9 16C9 14.5 11 12 12 9C13 12 15 14.5 15 16C15 17.657 13.657 19 12 19Z" />
            </svg>
          </span>
          BONFIRE
        </Link>

        <ul className="navbar__nav">
          <li>
            <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`} onClick={() => { setActiveGenre(null); setActivePublisher(null); setSearchQuery(''); }}>
              SHOP
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              COMMUNITY
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              INFO
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              SUPPORT
            </NavLink>
          </li>
        </ul>

        <div className="navbar__user" style={{ marginLeft: 'auto' }}>
          <button className="navbar__cart-btn" onClick={() => { setWishlistOpen(true); clearUnseenWishlist(); }} title="Wunschliste anzeigen">
            <GiftIcon size={20} style={{ verticalAlign: 'middle', marginTop: '-2px' }} />
            {unseenWishlistCount > 0 && <span className="navbar__cart-badge" style={{ background: 'var(--accent-gold)' }}>{unseenWishlistCount}</span>}
          </button>
          <button className="navbar__cart-btn" onClick={() => setCartOpen(true)} title="Warenkorb anzeigen">
            🛒
            {cart.length > 0 && <span className="navbar__cart-badge">{cart.length}</span>}
          </button>
          {currentUser ? (
            <>
              <button className="navbar__wallet" onClick={() => setWalletOpen(true)} title="Guthaben aufladen">
                {currentUser.wallet_balance.toFixed(2)} €
              </button>
              <Link to="/profile" className="navbar__avatar">
                {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : currentUser.display_name.charAt(0)}
              </Link>
            </>
          ) : (
            <button className="btn btn--primary btn--sm" onClick={() => setLoginOpen(true)}>Login</button>
          )}
        </div>
      </nav>

      <div className="subnavbar-container">
        <div className="subnavbar">
          <div className="subnavbar__links">
            <NavLink to="/" className={({ isActive }) => `subnavbar__link ${isActive ? 'active' : ''}`} onClick={() => { setActiveGenre(null); setActivePublisher(null); setSearchQuery(''); }}>Durchstöbern</NavLink>
            <NavLink to="/recommendations" className={({ isActive }) => `subnavbar__link ${isActive && window.location.pathname === '/recommendations' ? 'active' : ''}`}>Empfehlungen</NavLink>

            <div className="subnavbar__dropdown">
              <span className="subnavbar__link">Kategorien ▾</span>
              <div className="subnavbar__dropdown-content">
                <Link to="/" className="subnavbar__dropdown-item" onClick={() => { handleGenreClick(null); setActivePublisher(null); setSearchQuery(''); }}>Alle Genres</Link>
                {allTags.map(tag => (
                  <Link key={tag} to="/" className="subnavbar__dropdown-item" onClick={() => { handleGenreClick(tag); setActivePublisher(null); }}>
                    {tag}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
                <Link to="/" className="subnavbar__dropdown-item" onClick={() => { handleGenreClick('Free to Play'); setActivePublisher(null); }}>Free to Play</Link>
                <Link to="/" className="subnavbar__dropdown-item" onClick={() => { handleGenreClick('Pre-Order'); setActivePublisher(null); }}>Pre-Order</Link>
              </div>
            </div>

            <NavLink to="/publishers" className={({ isActive }) => `subnavbar__link ${isActive ? 'active' : ''}`}>Publisher</NavLink>
            <NavLink to="/reviews" className={({ isActive }) => `subnavbar__link ${isActive ? 'active' : ''}`}>Reviews</NavLink>
          </div>

          <div className="subnavbar__search">
            <input
              type="text"
              placeholder="Im Shop suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="subnavbar__search-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="app-layout">
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)', paddingBottom: '2rem' }}>
          <div style={{ flex: 1, paddingBottom: '4rem' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games/:id" element={<GameDetailsPage />} />
              <Route path="/publishers" element={<PublishersPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </div>

          <footer className="footer">
            <div className="footer__top-row">
              <div className="footer__brand-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C10.343 19 9 17.657 9 16C9 14.5 11 12 12 9C13 12 15 14.5 15 16C15 17.657 13.657 19 12 19Z" />
                </svg>
              </div>
              <div className="footer__main-content">
                <div className="footer__text">
                  © 2026 BONFIRE Corporation. Alle Rechte vorbehalten. Alle Marken sind Eigentum ihrer jeweiligen Besitzer in den USA und anderen Ländern.<br />
                  Inklusive Mehrwertsteuer, sofern zutreffend.
                </div>
                <div className="footer__links">
                  <a href="#">Datenschutzrichtlinien</a>
                  <span>|</span>
                  <a href="#">Rechtliches</a>
                  <span>|</span>
                  <a href="#">Barrierefreiheit</a>
                  <span>|</span>
                  <a href="#">Bonfire-Nutzungsvertrag</a>
                  <span>|</span>
                  <a href="#">Erstattungen</a>
                  <span>|</span>
                  <a href="#">Cookies</a>
                </div>
              </div>
            </div>

            <div className="footer__bottom-row">
              <div className="footer__bottom-links">
                <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Über BONFIRE</Link>
                <span>|</span>
                <a href="#">Jobs</a>
                <span>|</span>
                <a href="#">Impressum</a>
                <span>|</span>
                <a href="#">Vertrieb über Bonfire</a>
                <span>|</span>
                <Link to="/support" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Support</Link>
                <span>|</span>
                <a href="#">Wiederverwertung</a>
                <span>|</span>
                <a href="#">Geschenkkarten</a>
              </div>
              <div className="footer__socials">
                <a href="#" title="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" title="X (Twitter)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" title="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="#" title="TikTok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.69-5.18 2.7-6.52 1.25-.85 2.78-1.22 4.31-1.15.01 1.4 0 2.8-.02 4.2-.84-.11-1.74.02-2.45.51-.83.58-1.26 1.6-1.1 2.6.21 1.34 1.48 2.37 2.82 2.3 1.21-.07 2.25-.97 2.5-2.16.14-.65.2-1.32.2-1.99 0-5.1 0-10.2 0-15.3z" /></svg>
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
