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

        <div className={`review-card__recommendation ${review.recommended ? 'review-card__recommendation--positive' : 'review-card__recommendation--negative'}`}>
          {review.recommended ? 'Empfohlen' : 'Nicht empfohlen'}
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
