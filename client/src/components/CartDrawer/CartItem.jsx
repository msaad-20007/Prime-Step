import { useDispatch } from 'react-redux'
import { updateQty } from '../../store/cartSlice'

export default function CartItem({ item }) {
  const dispatch = useDispatch()
  const { _id, name, size, qty, price, discountPrice, image } = item
  const displayPrice = discountPrice ?? price

  const decrement = () => dispatch(updateQty({ _id, size, qty: qty - 1 }))
  const increment = () => dispatch(updateQty({ _id, size, qty: qty + 1 }))

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/10">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium truncate">{name}</p>
        <p className="text-sm text-white/50">Size: {size}</p>
        <p className="text-sm text-accent">${(displayPrice * qty).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrement}
          className="w-7 h-7 flex items-center justify-center rounded bg-white/10 text-text-primary hover:bg-white/20 transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-text-primary w-4 text-center">{qty}</span>
        <button
          onClick={increment}
          className="w-7 h-7 flex items-center justify-center rounded bg-white/10 text-text-primary hover:bg-white/20 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  )
}
