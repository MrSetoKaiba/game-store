import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'
import { createPurchase } from '../api'
import { Link } from 'react-router-dom'

function CartModal({ isOpen, onClose }) {
    const { cart, removeFromCart, clearCart, cartTotal, currentUser, updateUser } = useApp()
    const [purchasing, setPurchasing] = useState(false)
    const [done, setDone] = useState(false)

    const handlePurchase = async () => {
        if (!currentUser) {
            alert('Bitte melde dich an, um zu kaufen!')
            return
        }
        if (currentUser.wallet_balance < cartTotal) {
            alert('Nicht genug Guthaben! Bitte lade dein Konto auf.')
            return
        }

        setPurchasing(true)
        try {
            // Create a purchase for each item
            for (const game of cart) {
                await createPurchase({
                    user_id: currentUser.id,
                    game_id: game.id,
                    price_paid: game.price || 0
                })
            }
            // Update the local balance state to reflect the purchase correctly
            updateUser({ wallet_balance: currentUser.wallet_balance - cartTotal })

            clearCart()
            setDone(true)
            setTimeout(() => { setDone(false); onClose() }, 2000)
        } catch (err) {
            alert('Fehler beim Kaufen: ' + err.message)
        } finally {
            setPurchasing(false)
        }
    }

    const hasFunds = currentUser && currentUser.wallet_balance >= cartTotal

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Warenkorb (${cart.length})`}>
            {done ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ color: 'var(--accent-success)' }}>Kauf erfolgreich!</h3>
                </div>
            ) : cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <p>Dein Warenkorb ist leer</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map(game => (
                            <div key={game.id} className="cart-item">
                                <div className="cart-item__info">
                                    <strong>{game.title}</strong>
                                    <span className="cart-item__price">
                                        {game.price === 0 ? 'Kostenlos' : `${game.price.toFixed(2)} €`}
                                    </span>
                                </div>
                                <button
                                    className="btn btn--danger btn--sm"
                                    onClick={() => removeFromCart(game.id)}
                                >✕</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-total">
                        <span>Gesamt</span>
                        <div style={{ textAlign: 'right' }}>
                            <strong>{cartTotal.toFixed(2)} €</strong>
                            {currentUser && (
                                <div style={{ fontSize: '0.8rem', color: hasFunds ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                                    Guthaben: {currentUser.wallet_balance.toFixed(2)} €
                                </div>
                            )}
                        </div>
                    </div>

                    {!hasFunds && currentUser && (
                        <div style={{ padding: '0.5rem', background: 'rgba(255, 50, 50, 0.1)', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                            Zu wenig Guthaben.
                            <Link to="/profile" onClick={onClose} style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>
                                Jetzt aufladen
                            </Link>
                        </div>
                    )}

                    <div className="form-actions">
                        <button className="btn btn--ghost" onClick={clearCart}>Leeren</button>
                        <button
                            className="btn btn--success"
                            onClick={handlePurchase}
                            disabled={purchasing || !hasFunds}
                        >{purchasing ? 'Kaufe...' : 'Jetzt kaufen'}</button>
                    </div>
                </>
            )}
        </Modal>
    )
}

export default CartModal
