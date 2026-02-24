import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getGames, getSimilarGames, getSimilarGamesByTags } from '../api'

function RecommendationsPage() {
    const [games, setGames] = useState([])
    const [selectedGame, setSelectedGame] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [tagRecommendations, setTagRecommendations] = useState([])
    const [loading, setLoading] = useState(false)
    const [gamesLoading, setGamesLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    // Load games list on first interaction
    const loadGames = () => {
        if (games.length > 0) return
        setGamesLoading(true)
        getGames().then(setGames).catch(() => { }).finally(() => setGamesLoading(false))
    }

    const handleSearch = async () => {
        if (!selectedGame) return
        setLoading(true)
        setSearched(true)
        try {
            const data = await getSimilarGames(selectedGame, 3)
            setRecommendations(data)

            const tagData = await getSimilarGamesByTags(selectedGame, 3)
            setTagRecommendations(tagData)
        } catch {
            setRecommendations([])
            setTagRecommendations([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1 className="page-header__title">Spielempfehlungen</h1>
                <p className="page-header__subtitle">
                    Wähle ein Spiel und erhalte ähnliche Empfehlungen basierend auf Neo4j-Graph-Analyse
                </p>
            </div>

            <div className="recommendation-search">
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label>Spiel auswählen</label>
                    <select
                        value={selectedGame || ''}
                        onChange={e => setSelectedGame(e.target.value)}
                        onFocus={loadGames}
                    >
                        <option value="">
                            {gamesLoading ? 'Lade Spiele...' : 'Spiel wählen...'}
                        </option>
                        {games.map(g => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="btn btn--primary"
                    onClick={handleSearch}
                    disabled={!selectedGame || loading}
                    style={{ alignSelf: 'flex-end' }}
                >
                    {loading ? 'Suche...' : '🔍 Empfehlungen finden'}
                </button>
            </div>

            {loading && (
                <div className="loading-state">Neo4j analysiert den Spiele-Graphen...</div>
            )}

            {!loading && searched && recommendations.length === 0 && (
                <div className="recommendation-empty">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
                    <h3>Keine Empfehlungen gefunden</h3>
                    <p>Für dieses Spiel gibt es noch nicht genug Daten im Graphen. Probiere ein anderes Spiel!</p>
                </div>
            )}

            {!loading && recommendations.length > 0 && (
                <div className="section" style={{ marginTop: '2rem' }}>
                    <div className="section__header">
                        <h2 className="section__title">Spieler kauften auch</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Basierend auf Neo4j-Graph-Analyse
                        </span>
                    </div>
                    <div className="recommendation-results">
                        {recommendations.map((rec, i) => {
                            const game = rec.game
                            if (!game) return null
                            const gameId = game._id || game.id
                            return (
                                <Link to={`/games/${gameId}`} key={gameId || i} className="recommendation-card">
                                    <div className="recommendation-card__rank">#{i + 1}</div>
                                    <div className="recommendation-card__image">
                                        <img
                                            src={game.cover_url || `https://picsum.photos/seed/${gameId}/300/400`}
                                            alt={game.title}
                                        />
                                    </div>
                                    <div className="recommendation-card__info">
                                        <h3>{game.title}</h3>
                                        <p className="recommendation-card__desc">
                                            {game.description?.substring(0, 120)}{game.description?.length > 120 ? '...' : ''}
                                        </p>
                                        <div className="recommendation-card__meta">
                                            <span className="recommendation-card__price">
                                                {game.price === 0 ? 'Kostenlos' : `${game.price?.toFixed(2)} €`}
                                            </span>
                                            {rec.common_owners != null && (
                                                <span className="recommendation-card__owners">
                                                    👥 {rec.common_owners} gemeinsame Besitzer
                                                </span>
                                            )}
                                        </div>
                                        {game.tag_names && game.tag_names.length > 0 && (
                                            <div className="recommendation-card__tags">
                                                {game.tag_names.slice(0, 4).map(t => (
                                                    <span key={t} className="game-details__tag">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {!loading && tagRecommendations.length > 0 && (
                <div className="section" style={{ marginTop: '2rem' }}>
                    <div className="section__header">
                        <h2 className="section__title">Ähnliche Spiele (Nach Tags & Genres)</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Basierend auf gemeinsamen Tags
                        </span>
                    </div>
                    <div className="recommendation-results">
                        {tagRecommendations.map((rec, i) => {
                            const game = rec.game
                            if (!game) return null
                            const gameId = game._id || game.id
                            return (
                                <Link to={`/games/${gameId}`} key={gameId || i} className="recommendation-card">
                                    <div className="recommendation-card__rank">#{i + 1}</div>
                                    <div className="recommendation-card__image">
                                        <img
                                            src={game.cover_url || `https://picsum.photos/seed/${gameId}/300/400`}
                                            alt={game.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://picsum.photos/seed/${gameId}/300/400`;
                                            }}
                                        />
                                    </div>
                                    <div className="recommendation-card__info">
                                        <h3>{game.title}</h3>
                                        <p className="recommendation-card__desc">
                                            {game.description?.substring(0, 120)}{game.description?.length > 120 ? '...' : ''}
                                        </p>
                                        <div className="recommendation-card__meta">
                                            <span className="recommendation-card__price">
                                                {game.price === 0 ? 'Kostenlos' : `${game.price?.toFixed(2)} €`}
                                            </span>
                                            {rec.common_tags != null && (
                                                <span className="recommendation-card__owners" style={{ color: 'var(--accent-primary)' }}>
                                                    🏷️ {rec.common_tags} gleiche Tags ({rec.shared_tags?.join(', ')})
                                                </span>
                                            )}
                                        </div>
                                        {game.tag_names && game.tag_names.length > 0 && (
                                            <div className="recommendation-card__tags">
                                                {game.tag_names.slice(0, 4).map(t => (
                                                    <span key={t} className="game-details__tag">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecommendationsPage
