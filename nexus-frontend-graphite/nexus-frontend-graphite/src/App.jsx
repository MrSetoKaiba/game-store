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
import GiftIcon from './components/GiftIcon'
import { getGames } from './api'

function AppInner() {
  const { activeGenre, setActiveGenre, cart, wishlist, unseenWishlistCount, clearUnseenWishlist, searchQuery, setSearchQuery, currentUser } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [allTags, setAllTags] = useState([])

  const allowedTags = ['Action Adventure', 'Co-op', 'Competitive', 'Fantasy', 'Indie', 'Open World', 'RPG', 'Shooter']

  // Load all unique tags from games for sidebar
  useEffect(() => {
    getGames().then(games => {
      const tagSet = new Set()
      games.forEach(g => {
        if (g.tag_names) g.tag_names.forEach(t => tagSet.add(t))
      })
      // Only show tags that are in our allowed list
      setAllTags([...tagSet].filter(t => allowedTags.includes(t)).sort())
    }).catch(() => { })
  }, [])

  const handleGenreClick = (tag) => {
    setActiveGenre(prev => prev === tag ? null : tag)
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand" onClick={() => setActiveGenre(null)}>
          <span className="navbar__brand-icon">N</span>
          NEXUS
        </Link>

        <ul className="navbar__nav">
          <li>
            <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Store
            </NavLink>
          </li>
          <li>
            <NavLink to="/publishers" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Publisher
            </NavLink>
          </li>
          <li>
            <NavLink to="/reviews" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Reviews
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Community
            </NavLink>
          </li>
        </ul>

        <div className="navbar__search">
          <span className="navbar__search-icon">⌕</span>
          <input
            type="text"
            placeholder="Spiele suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="navbar__user">
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
            <button className="btn btn--primary btn--sm" onClick={() => alert("Login mock")}>Login</button>
          )}
        </div>
      </nav>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar__section">
            <div className="sidebar__title">Navigation</div>
            <ul className="sidebar__menu">
              <li>
                <NavLink to="/" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`} onClick={() => setActiveGenre(null)}>
                  Startseite
                </NavLink>
              </li>
              <li>
                <NavLink to="/recommendations" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                  Empfehlungen
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="sidebar__section">
            <div className="sidebar__title">Kategorien</div>
            <ul className="sidebar__menu">
              {allTags.map(tag => (
                <li key={tag}>
                  <Link
                    to="/"
                    className={`sidebar__link ${activeGenre === tag ? 'active' : ''}`}
                    onClick={() => handleGenreClick(tag)}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
              {allTags.length === 0 && (
                <li><span className="sidebar__link" style={{ color: 'var(--text-dim)' }}>Laden...</span></li>
              )}
            </ul>
          </div>

          <div className="sidebar__section">
            <div className="sidebar__title">Datenbank</div>
            <ul className="sidebar__menu">
              <li>
                <NavLink to="/publishers" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                  Publisher
                </NavLink>
              </li>
              <li>
                <NavLink to="/users" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                  User
                </NavLink>
              </li>
              <li>
                <NavLink to="/reviews" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                  Reviews
                </NavLink>
              </li>
            </ul>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games/:id" element={<GameDetailsPage />} />
            <Route path="/publishers" element={<PublishersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
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
