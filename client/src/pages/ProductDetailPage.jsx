import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetProductByIdQuery } from '../store/productsApi'
import { addToCart } from '../store/cartSlice'
import ImageGallery from '../components/ImageGallery'
import SizeSelector from '../components/SizeSelector'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    if (!selectedSize) { setSizeError(true); return }
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.discountPrice ?? product.price,
      image: product.images?.[0],
      size: selectedSize,
      qty: 1,
    }))
    setSizeError(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (isError || !product) return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-400">Product not found.</p>
      <Link to="/shop" className="text-accent hover:underline text-sm">← Back to Shop</Link>
    </div>
  )

  const totalStock = product.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0

  return (
    <div className="bg-background min-h-screen text-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Gallery */}
          <ImageGallery images={product.images ?? []} />

          {/* Right: Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-semibold mb-1">{product.brand}</p>
              <h1 className="text-3xl font-black leading-tight">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-black text-accent">${product.discountPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-600 line-through">${product.price.toFixed(2)}</span>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black">${product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">{totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-400 leading-relaxed text-sm border-t border-gray-800 pt-4">{product.description}</p>
            )}

            {/* Size selector */}
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold uppercase tracking-wider">Select Size</p>
              </div>
              <SizeSelector
                sizes={product.sizes ?? []}
                selectedSize={selectedSize}
                onSelect={size => { setSelectedSize(size); setSizeError(false) }}
              />
              {sizeError && <p className="text-red-400 text-sm mt-2">⚠ Please select a size before adding to cart</p>}
            </div>

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={totalStock === 0}
                className={`flex-1 font-bold py-4 rounded-xl text-sm tracking-widest uppercase transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : totalStock === 0
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-accent text-black hover:opacity-90'
                }`}
              >
                {added ? '✓ Added to Cart!' : totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-800 pt-4">
              {[
                { icon: '🚚', label: 'Free Shipping', sub: 'Orders over $150' },
                { icon: '↩', label: 'Free Returns', sub: '30-day policy' },
                { icon: '🔒', label: 'Secure Pay', sub: 'Stripe encrypted' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-xs font-semibold text-text-primary">{b.label}</p>
                  <p className="text-xs text-gray-600">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
