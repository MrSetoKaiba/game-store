import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getUsers } from './api'

const AppContext = createContext()

export function AppProvider({ children }) {
    // Genre filter
    const [activeGenre, setActiveGenre] = useState(null)

    // Search
    const [searchQuery, setSearchQuery] = useState('')

    // User State
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        getUsers().then(users => {
            if (users && users.length > 0) {
                setCurrentUser(users[0])
            } else {
                setCurrentUser({
                    id: 'fallback_id',
                    display_name: 'Willi',
                    real_name: 'Wilhelm',
                    email: 'willi@example.com',
                    avatar_url: '',
                    wallet_balance: 150.00,
                    address: { street: '', city: '', zip: '', country: '' },
                    payment_methods: []
                })
            }
        }).catch(() => {
            // fallback
            setCurrentUser({
                id: 'fallback_id',
                display_name: 'Willi',
                wallet_balance: 150.00,
            })
        })
    }, [])

    // Shopping cart
    const [cart, setCart] = useState([])

    // Wishlist
    const [wishlist, setWishlist] = useState([])
    const [unseenWishlistCount, setUnseenWishlistCount] = useState(0)

    const updateUser = useCallback((updates) => {
        setCurrentUser(prev => ({ ...prev, ...updates }))
    }, [])

    const addFunds = useCallback((amount) => {
        setCurrentUser(prev => ({ ...prev, wallet_balance: prev.wallet_balance + amount }))
    }, [])

    const logout = useCallback(() => {
        setCurrentUser(null)
    }, [])

    const loginAs = useCallback((user) => {
        setCurrentUser(user)
    }, [])

    const addToCart = useCallback((game) => {
        setCart(prev => {
            if (prev.some(item => item.id === game.id)) return prev
            return [...prev, game]
        })
    }, [])

    const removeFromCart = useCallback((gameId) => {
        setCart(prev => prev.filter(item => item.id !== gameId))
    }, [])

    const clearCart = useCallback(() => setCart([]), [])

    const isInCart = useCallback((gameId) => {
        return cart.some(item => item.id === gameId)
    }, [cart])

    const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0)

    const addToWishlist = useCallback((game) => {
        setWishlist(prev => {
            if (prev.some(item => item.id === game.id)) return prev
            setUnseenWishlistCount(c => c + 1)
            return [...prev, game]
        })
    }, [])

    const clearUnseenWishlist = useCallback(() => {
        setUnseenWishlistCount(0)
    }, [])

    const removeFromWishlist = useCallback((gameId) => {
        setWishlist(prev => prev.filter(item => item.id !== gameId))
    }, [])

    const isInWishlist = useCallback((gameId) => {
        return wishlist.some(item => item.id === gameId)
    }, [wishlist])

    return (
        <AppContext.Provider value={{
            activeGenre, setActiveGenre,
            searchQuery, setSearchQuery,
            currentUser, updateUser, addFunds, logout, loginAs,
            cart, addToCart, removeFromCart, clearCart, isInCart, cartTotal,
            wishlist, addToWishlist, removeFromWishlist, isInWishlist,
            unseenWishlistCount, clearUnseenWishlist
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    return useContext(AppContext)
}
