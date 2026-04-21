import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../store/productsApi'
import ProductCard from '../components/ProductCard'
import Logo from '../components/Logo'

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80')" }} />
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <p className="text-accent text-sm font-semibold tracking-[0.3em] uppercase mb-6">New Collection 2025</p>
        <h1 className="text-6xl md:text-8xl font-black text-text-primary leading-none mb-6">
          STEP INTO<br /><span className="text-accent">THE FUTURE</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-10">
          Premium men's footwear engineered for those who demand the best. Style meets performance.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link to="/shop" className="bg-accent text-black font-bold px-8 py-4 rounded hover:opacity-90 transition-opacity text-sm tracking-widest uppercase">Shop Now</Link>
          <Link to="/shop" className="border border-gray-600 text-text-primary font-semibold px-8 py-4 rounded hover:border-accent hover:text-accent transition-colors text-sm tracking-widest uppercase">View All</Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
    </section>
  )
}

function FeaturedProducts() {
  const { data, isLoading } = useGetProductsQuery({ page: 1, limit: 4 })
  const products = data?.products ?? []
  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-lg aspect-square animate-pulse" />)}
    </div>
  )
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}

function CategoryBanner({ label, image, to }) {
  return (
    <Link to={to} className="relative overflow-hidden rounded-lg group aspect-[4/3] block">
      <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
      <div className="absolute bottom-4 left-4">
        <span className="text-white font-bold text-xl">{label}</span>
        <div className="h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-300 mt-1" />
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen text-text-primary">
      <HeroSection />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent text-xs tracking-[0.3em] uppercase mb-2">Hand-picked</p>
            <h2 className="text-3xl font-bold">Featured Drops</h2>
          </div>
          <Link to="/shop" className="text-accent text-sm hover:underline tracking-wide">View all →</Link>
        </div>
        <FeaturedProducts />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="mb-10">
          <p className="text-accent text-xs tracking-[0.3em] uppercase mb-2">Browse by</p>
          <h2 className="text-3xl font-bold">Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CategoryBanner label="Running"    image="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80" to="/shop" />
          <CategoryBanner label="Lifestyle"  image="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80" to="/shop" />
          <CategoryBanner label="Basketball" image="https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80" to="/shop" />
          <CategoryBanner label="Trail"      image="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80" to="/shop" />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-b border-gray-800 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            FREE SHIPPING<br /><span className="text-accent">OVER $150</span>
          </h2>
          <p className="text-gray-400 mb-8">Every order ships fast. No minimums on returns. Ever.</p>
          <Link to="/shop" className="inline-block bg-accent text-black font-bold px-10 py-4 rounded hover:opacity-90 transition-opacity tracking-widest uppercase text-sm">
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm border-t border-gray-900">
        <Logo size="sm" />
        <span>© 2025 Prime Step — Men's Footwear. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/shop"     className="hover:text-accent transition-colors">Shop</Link>
          <Link to="/login"    className="hover:text-accent transition-colors">Login</Link>
          <Link to="/register" className="hover:text-accent transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  )
}
