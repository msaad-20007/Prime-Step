import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CartItem from './CartItem'

export default function CartDrawer({ isOpen, onClose }) {
  const items = useSelector((state) => state.cart.items)

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice ?? item.price
    return sum + price * item.qty
  }, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-card z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-accent text-lg font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-accent transition-colors text-xl leading-none"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <p className="text-white/50 text-center mt-12">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <CartItem key={`${item._id}-${item.size}`} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            <div className="flex justify-between text-text-primary mb-4">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-accent text-black font-semibold py-3 rounded hover:opacity-90 transition-opacity"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
