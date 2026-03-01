import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../AppContext'

function GameCard({ game }) {
  const { addToCart, isInCart, addToWishlist, removeFromWishlist, isInWishlist, setActivePublisher, isPurchased } = useApp()
  const navigate = useNavigate()
  const isFree = game.price === 0
  const [isStarting, setIsStarting] = useState(false)

  const isPreOrder = () => {
    if (!game.release_date) return false;
    const euMatch = game.release_date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (euMatch) return new Date(parseInt(euMatch[3]), parseInt(euMatch[2]) - 1, parseInt(euMatch[1])) > new Date();
    const isoMatch = game.release_date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])) > new Date();
    return false;
  };

  const handleCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFree && isPurchased(game.id)) {
      if (!isStarting) {
        setIsStarting(true)
        setTimeout(() => setIsStarting(false), 2000)
      }
    } else if (!isInCart(game.id) && !isPurchased(game.id)) {
      addToCart(game)
    }
  }

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id)
    } else {
      addToWishlist(game)
    }
  }

  const handlePublisherClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setActivePublisher(game.publisher)
    navigate('/')
  }

  return (
    <Link to={`/games/${game.id}`} className="game-card">
      <div className="game-card__image-wrapper">
        <img
          src={game.cover_url || `https://picsum.photos/seed/${game.id}/300/400`}
          alt={game.title}
          className="game-card__image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${game.id}/300/400`;
          }}
        />
        <div className="game-card__overlay">
          <div className="game-card__quick-actions">
            <button className={`btn btn--sm ${isInCart(game.id) ? 'btn--secondary' : 'btn--primary'}`} style={{ flex: 1 }} onClick={handleCartClick}>
              {(isFree && isPurchased(game.id)) ? (isStarting ? 'Wird gestartet...' : 'Spielen') : (isInCart(game.id) ? 'Im Warenkorb ✔' : (isPreOrder() ? 'Vorbestellen' : (isPurchased(game.id) ? 'Gekauft' : 'Kaufen')))}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={handleWishlistClick}
              style={{ width: '38px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}
            >
              <span style={{ display: 'inline-block', lineHeight: 1, marginTop: '2px' }}>{isInWishlist(game.id) ? '♥' : '♡'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="game-card__content">
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__publisher">
          {game.publisher ? (
            <span style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onClick={handlePublisherClick}>
              {game.publisher}
            </span>
          ) : ''}
        </p>
        <div className="game-card__footer">
          <span className={`game-card__price ${isFree ? 'game-card__price--free' : ''}`}>
            {isFree ? 'Free to Play' : `${game.price.toFixed(2)} €`}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default GameCard
