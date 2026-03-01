function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`review-card__star ${i < rating ? '' : 'review-card__star--empty'}`}
      >
        ★
      </span>
    ))
  }

  const userName = review.user || review.user_id || 'Unbekannt'
  const gameName = review.game || review.game_id || ''

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="review-card__user-info">
          <div className="review-card__username">{userName}</div>
          {gameName && (
            <span className="review-card__game-title">{gameName}</span>
          )}
          <div className="review-card__meta">
            {review.playtime_hours || 0}h gespielt
          </div>
        </div>

        <div
          className="review-card__recommendation"
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            color: review.recommended ? 'var(--accent-success)' : 'var(--accent-danger)',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem'
          }}
        >
          {review.recommended ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Empfohlen</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span>Nicht empfohlen</span>
            </>
          )}
        </div>
      </div>

      <div className="review-card__rating">
        {renderStars(review.rating)}
      </div>

      {review.text && <p className="review-card__text">{review.text}</p>}
    </div>
  )
}

export default ReviewCard
