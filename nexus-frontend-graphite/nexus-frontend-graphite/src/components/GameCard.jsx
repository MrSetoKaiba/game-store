import { Link } from 'react-router-dom'

function GameCard({ game }) {
  const isFree = game.price === 0

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
            <button className="btn btn--primary btn--sm" style={{ flex: 1 }}>
              {isFree ? 'Spielen' : 'Kaufen'}
            </button>
            <button className="btn btn--secondary btn--sm">♡</button>
          </div>
        </div>
        {isFree && <span className="game-card__badge game-card__badge--free">Free</span>}
      </div>

      <div className="game-card__content">
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__publisher">{game.publisher}</p>
        <div className="game-card__footer">
          <span className={`game-card__price ${isFree ? 'game-card__price--free' : ''}`}>
            {isFree ? 'Kostenlos' : `${game.price.toFixed(2)} €`}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default GameCard
