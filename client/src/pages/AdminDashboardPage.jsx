import { useState } from 'react'
import { useGetProductsQuery, useUpdateProductMutation, useCreateProductMutation, useDeleteProductMutation } from '../store/productsApi'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, useDeleteOrderMutation } from '../store/ordersApi'
import { useGetAllUsersQuery, useDeleteUserMutation } from '../store/usersApi'

const INPUT_CLASS = 'bg-background border border-gray-700 text-text-primary rounded px-2 py-1 w-24 text-sm'
const TRACKING_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered']

// ─── Inventory helpers ─────────────────────────────────────────────────────────
function DiscountPriceCell({ product }) {
  const [updateProduct] = useUpdateProductMutation()
  const [value, setValue] = useState(product.discountPrice != null ? String(product.discountPrice) : '')
  function handleBlur() {
    const parsed = parseFloat(value) || null
    const original = product.discountPrice != null ? product.discountPrice : null
    if (parsed !== original) updateProduct({ id: product._id, discountPrice: parsed })
  }
  return <input type="number" className={INPUT_CLASS} value={value} onChange={e => setValue(e.target.value)} onBlur={handleBlur} placeholder="None" />
}

function StockCell({ product, sizeEntry }) {
  const [updateProduct] = useUpdateProductMutation()
  const [value, setValue] = useState(String(sizeEntry.stock))
  function handleBlur() {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed === sizeEntry.stock) return
    const updatedSizes = product.sizes.map(s => s.size === sizeEntry.size ? { ...s, stock: parsed } : s)
    updateProduct({ id: product._id, sizes: updatedSizes })
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-gray-400">{sizeEntry.size}:</span>
      <input type="number" className="bg-background border border-gray-700 text-text-primary rounded px-1 py-0.5 w-14 text-xs" value={value} onChange={e => setValue(e.target.value)} onBlur={handleBlur} />
    </span>
  )
}

// ─── Order helpers ─────────────────────────────────────────────────────────────
function OrderStatusSelect({ order }) {
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [value, setValue] = useState(order.trackingStatus ?? 'Pending')
  function handleChange(e) {
    setValue(e.target.value)
    updateOrderStatus({ id: order._id, trackingStatus: e.target.value })
  }
  return (
    <select className="bg-background border border-gray-700 text-text-primary rounded px-2 py-1 text-sm" value={value} onChange={handleChange}>
      {TRACKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}

// Dynamic isPaid toggle — works for COD and manual payments
function PaidToggle({ order }) {
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [isPaid, setIsPaid] = useState(order.isPaid ?? false)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const newVal = !isPaid
    setLoading(true)
    try {
      await updateOrderStatus({ id: order._id, isPaid: newVal, unpaid: !newVal }).unwrap()
      setIsPaid(newVal)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
      className={`text-xs px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
        isPaid
          ? 'bg-green-900/50 text-green-400 border-green-700 hover:bg-red-900/30 hover:text-red-400 hover:border-red-700'
          : 'bg-yellow-900/50 text-yellow-400 border-yellow-700 hover:bg-green-900/30 hover:text-green-400 hover:border-green-700'
      }`}
    >
      {loading ? '...' : isPaid ? '✓ Paid' : 'Unpaid'}
    </button>
  )
}

// ─── Add Product Modal ─────────────────────────────────────────────────────────
function AddProductModal({ onClose }) {
  const [createProduct, { isLoading }] = useCreateProductMutation()
  const [form, setForm] = useState({ name: '', brand: '', category: '', price: '', description: '', imageUrls: '', sizes: '' })
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageTab, setImageTab] = useState('url')
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleFileChange(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setUploadedImages(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const urlImages = form.imageUrls.split(',').map(s => s.trim()).filter(Boolean)
    const sizes = form.sizes.split(',').map(s => {
      const [size, stock] = s.trim().split(':')
      return { size: size?.trim(), stock: parseInt(stock) || 0 }
    }).filter(s => s.size)
    try {
      await createProduct({ name: form.name, brand: form.brand, category: form.category, price: parseFloat(form.price), description: form.description, images: [...urlImages, ...uploadedImages], sizes }).unwrap()
      onClose()
    } catch (err) { setError(err?.data?.message || 'Failed to create product') }
  }

  const inputCls = 'w-full bg-background border border-gray-700 text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent'
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-xl p-6 w-full max-w-lg border border-gray-700 my-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-accent font-bold text-lg">Add New Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        {error && <div className="bg-red-900/30 border border-red-500/40 rounded px-3 py-2 text-red-400 text-sm mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Name *</label><input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Brand *</label><input required className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Category *</label><input required className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Running, Lifestyle..." /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Price ($) *</label><input required type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea className={inputCls} rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Product Images <span className="text-gray-600">(optional)</span></label>
            <div className="flex gap-1 mb-3">
              {['url', 'upload'].map(t => (
                <button key={t} type="button" onClick={() => setImageTab(t)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${imageTab === t ? 'bg-accent text-black' : 'border border-gray-700 text-gray-400 hover:text-text-primary'}`}>
                  {t === 'url' ? '🔗 URL' : '📁 Upload'}
                </button>
              ))}
            </div>
            {imageTab === 'url' && <input className={inputCls} value={form.imageUrls} onChange={e => set('imageUrls', e.target.value)} placeholder="https://example.com/img.jpg, ..." />}
            {imageTab === 'upload' && (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-accent transition-colors">
                  <span className="text-gray-500 text-sm">Click to select images</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {uploadedImages.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-14 h-14 object-cover rounded border border-gray-700" />
                        <button type="button" onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sizes & Stock *</label>
            <input required className={inputCls} value={form.sizes} onChange={e => set('sizes', e.target.value)} placeholder="US 7:10, US 8:15, US 9:8" />
            <p className="text-xs text-gray-600 mt-1">Format: SIZE:STOCK — e.g. US 8:10, US 9:5</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-text-primary py-2.5 rounded text-sm hover:border-gray-400">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-accent text-black font-bold py-2.5 rounded text-sm hover:opacity-90 disabled:opacity-50">{isLoading ? 'Adding...' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Inventory Section ─────────────────────────────────────────────────────────
function InventorySection() {
  const { data, isLoading, isError } = useGetProductsQuery({ page: 1, limit: 100 })
  const [deleteProduct] = useDeleteProductMutation()
  const [showAdd, setShowAdd] = useState(false)
  const products = data?.products ?? []

  if (isLoading) return <p className="text-gray-400 py-4">Loading inventory...</p>
  if (isError) return <p className="text-red-500 py-4">Failed to load products.</p>

  return (
    <>
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">{products.length} products</p>
        <button onClick={() => setShowAdd(true)} className="bg-accent text-black text-sm font-bold px-4 py-2 rounded hover:opacity-90">+ Add Product</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left text-xs uppercase tracking-wider">
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Discount</th>
              <th className="py-3 pr-4">Stock per Size</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-b border-gray-800 align-top hover:bg-white/5 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />}
                    <div><p className="text-text-primary font-medium">{product.name}</p><p className="text-gray-500 text-xs">{product.brand}</p></div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-300">{product.category}</td>
                <td className="py-3 pr-4 text-text-primary">${product.price}</td>
                <td className="py-3 pr-4"><DiscountPriceCell product={product} /></td>
                <td className="py-3 pr-4"><div className="flex flex-wrap gap-1">{product.sizes?.map(s => <StockCell key={s.size} product={product} sizeEntry={s} />)}</div></td>
                <td className="py-3">
                  <button onClick={() => { if (window.confirm(`Delete "${product.name}"?`)) deleteProduct(product._id) }} className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 px-2 py-1 rounded hover:border-red-400 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── Orders Section ────────────────────────────────────────────────────────────
function OrdersSection() {
  const { data: orders, isLoading, isError } = useGetAllOrdersQuery()
  const [deleteOrder] = useDeleteOrderMutation()

  if (isLoading) return <p className="text-gray-400 py-4">Loading orders...</p>
  if (isError) return <p className="text-red-500 py-4">Failed to load orders.</p>
  if (!orders?.length) return <p className="text-gray-500 py-4">No orders yet.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left text-xs uppercase tracking-wider">
            <th className="py-3 pr-4">Order ID</th>
            <th className="py-3 pr-4">Customer</th>
            <th className="py-3 pr-4">Ship To</th>
            <th className="py-3 pr-4">Items</th>
            <th className="py-3 pr-4">Total</th>
            <th className="py-3 pr-4">Date</th>
            <th className="py-3 pr-4">Payment</th>
            <th className="py-3 pr-4">Paid Status</th>
            <th className="py-3 pr-4">Tracking</th>
            <th className="py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors align-top">
              <td className="py-3 pr-4 font-mono text-xs text-gray-400">#{order._id?.slice(-8).toUpperCase()}</td>
              <td className="py-3 pr-4 text-text-primary text-xs">{order.user?.name ?? '—'}<br /><span className="text-gray-500">{order.user?.email}</span></td>
              <td className="py-3 pr-4 text-gray-400 text-xs">
                {order.shippingAddress
                  ? <>{order.shippingAddress.fullName}<br />{order.shippingAddress.city}, {order.shippingAddress.state}<br />{order.shippingAddress.phone}</>
                  : '—'}
              </td>
              <td className="py-3 pr-4 text-gray-300 text-xs">{order.orderItems?.length ?? 0}</td>
              <td className="py-3 pr-4 text-accent font-semibold">${order.totalPrice?.toFixed(2)}</td>
              <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="py-3 pr-4 text-xs">
                <span className="text-gray-300">{order.paymentMethod ?? 'Stripe'}</span>
                {order.manualPayment?.transactionId && <p className="text-gray-600 mt-0.5">TXN: {order.manualPayment.transactionId}</p>}
              </td>
              {/* Dynamic paid toggle — click to flip */}
              <td className="py-3 pr-4"><PaidToggle order={order} /></td>
              <td className="py-3 pr-4"><OrderStatusSelect order={order} /></td>
              <td className="py-3">
                <button onClick={() => { if (window.confirm('Delete this order?')) deleteOrder(order._id) }} className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 px-2 py-1 rounded hover:border-red-400 transition-colors">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Customers Section ─────────────────────────────────────────────────────────
function CustomersSection() {
  const { data: users, isLoading, isError } = useGetAllUsersQuery()
  const [deleteUser] = useDeleteUserMutation()
  const [search, setSearch] = useState('')

  if (isLoading) return <p className="text-gray-400 py-4">Loading customers...</p>
  if (isError) return <p className="text-red-500 py-4">Failed to load customers.</p>
  if (!users?.length) return <p className="text-gray-500 py-4">No customers yet.</p>

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{users.length} customers</p>
        <input
          className="bg-background border border-gray-700 text-text-primary rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent w-56"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left text-xs uppercase tracking-wider">
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Joined</th>
              <th className="py-3 pr-4">Total Orders</th>
              <th className="py-3 pr-4">Total Spent</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-3 pr-4">
                  <span className={`text-sm font-semibold ${user.orderCount > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {user.orderCount} order{user.orderCount !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-sm font-semibold ${user.totalSpent > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                    ${user.totalSpent.toFixed(2)}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => { if (window.confirm(`Delete customer "${user.name}"? This cannot be undone.`)) deleteUser(user._id) }}
                    className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 px-2 py-1 rounded hover:border-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [tab, setTab] = useState('inventory')
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100 })
  const { data: orders } = useGetAllOrdersQuery()
  const { data: users } = useGetAllUsersQuery()

  const productCount = productsData?.total ?? 0
  const orderCount = orders?.length ?? 0
  const customerCount = users?.length ?? 0
  const revenue = orders?.reduce((s, o) => s + (o.isPaid ? o.totalPrice : 0), 0) ?? 0

  const TABS = ['inventory', 'orders', 'customers']

  return (
    <div className="bg-background min-h-screen text-text-primary">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-accent tracking-wider">ADMIN DASHBOARD</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store inventory, orders and customers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Products',  value: productCount,          color: 'text-accent' },
            { label: 'Orders',    value: orderCount,            color: 'text-blue-400' },
            { label: 'Customers', value: customerCount,         color: 'text-purple-400' },
            { label: 'Revenue',   value: `$${revenue.toFixed(2)}`, color: 'text-green-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 w-fit border border-gray-800">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-accent text-black' : 'text-gray-400 hover:text-text-primary'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl p-6 border border-gray-800">
          {tab === 'inventory' && <InventorySection />}
          {tab === 'orders'    && <OrdersSection />}
          {tab === 'customers' && <CustomersSection />}
        </div>
      </div>
    </div>
  )
}
