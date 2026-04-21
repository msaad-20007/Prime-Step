import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const { _id, name, brand, price, discountPrice, images } = product
  const image = images && images.length > 0 ? images[0] : null

  return (
    <Link
      to={`/products/${_id}`}
      className="group block bg-card rounded-lg overflow-hidden border border-transparent hover:border-accent transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="aspect-square overflow-hidden bg-[#1a1a1a]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{brand}</p>
        <p className="text-text-primary text-sm font-medium leading-tight mb-2 line-clamp-2">{name}</p>
        <div className="flex items-center gap-2">
          {discountPrice ? (
            <>
              <span className="text-accent font-semibold">${discountPrice.toFixed(2)}</span>
              <span className="text-gray-500 line-through text-sm">${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-text-primary font-semibold">${price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
