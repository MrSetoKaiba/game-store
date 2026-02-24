import { useApp } from '../AppContext'
import Modal from './Modal'
import { Link } from 'react-router-dom'
import GiftIcon from './GiftIcon'

function WishlistModal({ isOpen, onClose }) {
    const { wishlist, removeFromWishlist, addToCart } = useApp()

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Wunschliste (${wishlist.length})`} customStyle={{ maxWidth: '750px' }}>
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <div style={{ margin: '0 0 1rem 0' }}>
                        <GiftIcon size={48} />
                    </div>
                    <p>Deine Wunschliste ist leer</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {wishlist.map(game => (
                            <div key={game.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid var(--glass-border)',
                                gap: '1.5rem'
                            }}>
                                <img
                                    src={game.cover_url || `https://picsum.photos/seed/${game.id}/180/240`}
                                    alt={game.title}
                                    style={{
                                        width: '90px',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--border-radius-sm)',
                                        boxShadow: 'var(--shadow-md)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <strong style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--text-primary)',
                                        display: 'block',
                                        marginBottom: '0.4rem',
                                        lineHeight: 1.3
                                    }}>
                                        {game.title}
                                    </strong>
                                    <span style={{
                                        display: 'block',
                                        fontSize: '1.1rem',
                                        color: 'var(--accent-success)',
                                        fontWeight: 'bold'
                                    }}>
                                        {game.price === 0 ? 'Kostenlos' : `${parseFloat(game.price).toFixed(2)} €`}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    minWidth: '180px'
                                }}>
                                    <button
                                        className="btn btn--primary btn--sm"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => {
                                            addToCart(game)
                                            removeFromWishlist(game.id)
                                        }}
                                        title="In den Warenkorb"
                                    >
                                        In den Warenkorb
                                    </button>
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        style={{ width: '100%', justifyContent: 'center', borderColor: 'transparent', color: 'var(--text-muted)' }}
                                        onMouseEnter={(e) => { e.target.style.color = 'var(--accent-danger)' }}
                                        onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)' }}
                                        onClick={() => removeFromWishlist(game.id)}
                                        title="Von Wunschliste entfernen"
                                    >
                                        Entfernen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Modal>
    )
}

export default WishlistModal
