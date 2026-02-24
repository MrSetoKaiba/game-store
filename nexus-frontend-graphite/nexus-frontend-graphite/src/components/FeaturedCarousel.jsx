import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GiftIcon from './GiftIcon'
import { useApp } from '../AppContext'

function FeaturedCarousel({ games }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useApp()
  const [activeIndex, setActiveIndex] = useState(0)
  const [userInteracted, setUserInteracted] = useState(false)
  const featured = games?.slice(0, 5) || []

  useEffect(() => {
    if (featured.length === 0 || userInteracted) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [featured.length, userInteracted])

  const nextSlide = () => {
    setUserInteracted(true)
    setActiveIndex(prev => (prev + 1) % featured.length)
  }

  const prevSlide = () => {
    setUserInteracted(true)
    setActiveIndex(prev => (prev - 1 + featured.length) % featured.length)
  }

  const handleDotClick = (index) => {
    setUserInteracted(true)
    setActiveIndex(index)
  }

  const handleWishlist = (game) => {
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id)
    } else {
      addToWishlist(game)
    }
  }

  if (featured.length === 0) return null

  return (
    <div className="hero">
      {featured.map((game, index) => (
        <div key={game.id} className={`hero__slide ${index === activeIndex ? 'active' : ''}`}>
          <img
            src={game.cover_url || `https://picsum.photos/seed/${game.id}/1200/600`}
            alt={game.title}
            className="hero__image"
          />
          <div className="hero__overlay" />
          <div className="hero__content">
            <div className="hero__info">
              <span className="hero__tag">Featured</span>
              <h1 className="hero__title">{game.title}</h1>
              <p className="hero__description">{game.description}</p>
              <div className="hero__meta">
                <span className="hero__price">
                  {game.price === 0 ? 'Kostenlos' : `${game.price.toFixed(2)} €`}
                </span>
              </div>
              <div className="hero__actions">
                <Link to={`/games/${game.id}`} className="btn btn--primary btn--lg">
                  Jetzt kaufen
                </Link>
                <button
                  className={`btn btn--lg ${isInWishlist(game.id) ? 'btn--ghost' : 'btn--secondary'}`}
                  onClick={() => handleWishlist(game)}
                >
                  <GiftIcon filled={isInWishlist(game.id)} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  {isInWishlist(game.id) ? 'Auf Wunschliste' : 'Wunschliste'}
                </button>
              </div>
            </div>

            <div className="hero__poster-container">
              <img
                src={game.cover_url || `https://picsum.photos/seed/${game.id}/600/800`}
                alt={`${game.title} Poster`}
              />
            </div>
          </div>
        </div>
      ))}
      <button className="hero__arrow hero__arrow--prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={nextSlide}>
        &#10095;
      </button>

      <div className="hero__dots">
        {featured.map((_, index) => (
          <button
            key={index}
            className={`hero__dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default FeaturedCarousel
