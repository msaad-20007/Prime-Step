import { useState, useMemo } from 'react'
import { useGetProductsQuery } from '../store/productsApi'
import ProductCard from '../components/ProductCard'

export default function ShopPage() {
  const { data, isLoading, isError } = useGetProductsQuery({ page: 1, limit: 50 })
  const products = data?.products ?? []
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(), [products])
  const sizes = useMemo(() => {
    const set = new Set()
    products.forEach(p => p.sizes?.forEach(s => set.add(s.size)))
    return Array.from(set).sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.]/g, ''))
      const nb = parseFloat(b.replace(/[^0-9.]/g, ''))
      return na - nb
    })
  }, [products])

  const filteredProducts = useMemo(() => products.filter(p => {
    const catOk = selectedCategories.length === 0 || selectedCategories.includes(p.category)
    const sizeOk = selectedSizes.length === 0 || p.sizes?.some(s => selectedSizes.includes(s.size))
    return catOk && sizeOk
  }), [products, selectedCategories, selectedSizes])

  const hasFilters = selectedCategories.length > 0 || selectedSizes.length > 0
  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  const clearFilters = () => { setSelectedCategories([]); setSelectedSizes([]) }

  const Sidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Filters</h2>
        {hasFilters && <button onClick={clearFilters} className="text-xs text-accent hover:underline">Clear all</button>}
      </div>

      {categories.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-accent border-accent' : 'border-gray-600 group-hover:border-gray-400'}`}>
                  {selectedCategories.includes(cat) && <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <input type="checkbox" className="sr-only" checked={selectedCategories.includes(cat)} onChange={() => toggle(selectedCategories, setSelectedCategories, cat)} />
                <span className="text-sm text-gray-300 group-hover:text-text-primary transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => toggle(selectedSizes, setSelectedSizes, size)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${selectedSizes.includes(size) ? 'bg-accent text-black border-accent' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-text-primary'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-background min-h-screen text-text-primary">
      {/* Page header */}
      <div className="border-b border-gray-800 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-wider">ALL SHOES</h1>
            <p className="text-gray-500 text-sm mt-0.5">{isLoading ? '...' : `${filteredProducts.length} products`}</p>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden flex items-center gap-2 text-sm border border-gray-700 px-3 py-2 rounded hover:border-accent hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" /></svg>
            Filters {hasFilters && <span className="bg-accent text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{selectedCategories.length + selectedSizes.length}</span>}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-card border border-gray-800 rounded-xl p-5">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-card w-72 h-full p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-text-primary">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-card rounded-xl aspect-[3/4] animate-pulse" />)}
            </div>
          )}

          {isError && <p className="text-red-400 py-10 text-center">Failed to load products. Make sure the server is running.</p>}

          {!isLoading && !isError && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-gray-500 text-lg mb-3">No products found</p>
              {hasFilters && <button onClick={clearFilters} className="text-accent text-sm hover:underline">Clear filters</button>}
            </div>
          )}

          {!isLoading && !isError && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <div key={product._id} className={(index + 1) % 7 === 0 ? 'col-span-2' : ''}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
