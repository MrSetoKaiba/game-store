import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getGames, getSimilarGames, getSimilarGamesByTags } from '../api'
import Modal from '../components/Modal'

function RecommendationsPage() {
    const [games, setGames] = useState([])
    const [selectedGame, setSelectedGame] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [tagRecommendations, setTagRecommendations] = useState([])
    const [loading, setLoading] = useState(false)
    const [gamesLoading, setGamesLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [ownersModal, setOwnersModal] = useState({ isOpen: false, title: '', owners: [] })
    const [tagsModal, setTagsModal] = useState({ isOpen: false, title: '', tags: [] })

    // State aus dem SessionStorage laden, damit es beim "Zurück"-Navigieren erhalten bleibt
    useEffect(() => {
        // Lade aktuelle Spielliste um Cache zu validieren
        getGames().then(currentGames => {
            setGames(currentGames)
            const currentIds = new Set(currentGames.map(g => g.id))
            const cached = sessionStorage.getItem('bonfire_recs_state')
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    // Validiere, ob das gewählte Spiel noch existiert
                    if (parsed.searched && parsed.selectedGame && currentIds.has(parsed.selectedGame)) {
                        setSelectedGame(parsed.selectedGame)
                        // Filtere nur Empfehlungen mit noch existierenden Spielen
                        const validRecs = (parsed.recommendations || []).filter(r => r.game && currentIds.has(r.game._id || r.game.id))
                        const validTagRecs = (parsed.tagRecommendations || []).filter(r => r.game && currentIds.has(r.game._id || r.game.id))
                        setRecommendations(validRecs)
                        setTagRecommendations(validTagRecs)
                        setSearched(true)
                    } else {
                        sessionStorage.removeItem('bonfire_recs_state')
                    }
                } catch (e) {
                    console.error('Cache Fehler:', e)
                    sessionStorage.removeItem('bonfire_recs_state')
                }
            }
        }).catch(() => { })
    }, [])

    // Jeden erfolgreichen Such-State sofort speichern
    useEffect(() => {
        if (searched) {
            sessionStorage.setItem('bonfire_recs_state', JSON.stringify({
                games, selectedGame, recommendations, tagRecommendations, searched
            }))
        }
    }, [games, selectedGame, recommendations, tagRecommendations, searched])

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
                    Wähle ein Spiel und erhalte ähnliche Empfehlungen
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
                    {loading ? 'Suche...' : 'Empfehlungen finden'}
                </button>
            </div>

            {loading && (
                <div className="loading-state">Suche nach passenden Empfehlungen...</div>
            )}

            {!loading && searched && recommendations.length === 0 && (
                <div className="recommendation-empty">
                    <h3>Keine Empfehlungen gefunden</h3>
                    <p>Für dieses Spiel gibt es noch nicht genug Spielerdaten. Probiere ein anderes Spiel!</p>
                </div>
            )}

            {!loading && recommendations.length > 0 && (
                <div className="section" style={{ marginTop: '2rem' }}>
                    <div className="section__header">
                        <h2 className="section__title">Spieler kauften auch</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Basierend auf Spielerkäufen
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
                                                {game.price === 0 ? 'Free to Play' : `${game.price?.toFixed(2)} €`}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                                                {game.tag_names && game.tag_names.length > 0 && (
                                                    <div className="recommendation-card__tags" style={{ margin: 0 }}>
                                                        {game.tag_names.slice(0, 2).map(t => (
                                                            <span key={t} className="game-details__tag" style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {rec.common_owners != null && (
                                                    <button
                                                        className="game-details__tag"
                                                        style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOwnersModal({
                                                                isOpen: true,
                                                                title: `Besitzer von ${game.title}`,
                                                                owners: rec.owner_names || []
                                                            });
                                                        }}
                                                    >
                                                        {rec.common_owners} gemeinsame Besitzer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
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
                        <h2 className="section__title">Ähnliche Spiele</h2>
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
                                                {game.price === 0 ? 'Free to Play' : `${game.price?.toFixed(2)} €`}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                                                {game.tag_names && game.tag_names.length > 0 && (
                                                    <div className="recommendation-card__tags" style={{ margin: 0 }}>
                                                        {game.tag_names.slice(0, 2).map(t => (
                                                            <span key={t} className="game-details__tag" style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {rec.common_tags != null && (
                                                    <button
                                                        className="game-details__tag"
                                                        style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setTagsModal({
                                                                isOpen: true,
                                                                title: `Gemeinsame Tags mit ${game.title}`,
                                                                tags: rec.shared_tags || []
                                                            });
                                                        }}
                                                    >
                                                        {rec.common_tags} gleiche Tags
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            <Modal isOpen={ownersModal.isOpen} onClose={() => setOwnersModal({ isOpen: false, title: '', owners: [] })} title={ownersModal.title}>
                {ownersModal.owners && ownersModal.owners.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {ownersModal.owners.map((owner, idx) => (
                            <li key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.8rem', background: 'var(--bg-light)',
                                borderRadius: 'var(--border-radius)', border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', color: 'black',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1rem'
                                }}>
                                    {(owner || '?').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{owner}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Keine konkreten Benutzer-Informationen vorhanden.</p>
                )}
            </Modal>

            <Modal isOpen={tagsModal.isOpen} onClose={() => setTagsModal({ isOpen: false, title: '', tags: [] })} title={tagsModal.title}>
                {tagsModal.tags && tagsModal.tags.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {tagsModal.tags.map((tag, idx) => (
                            <li key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.8rem', background: 'var(--bg-light)',
                                borderRadius: 'var(--border-radius)', border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--accent-secondary, #6366f1)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.85rem'
                                }}>
                                    #
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tag}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Keine Tag-Informationen vorhanden.</p>
                )}
            </Modal>
        </div>
    )
}

export default RecommendationsPage
