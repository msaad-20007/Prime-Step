import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../store/ordersApi'
import { logout } from '../store/authSlice'
import OrderTracker from '../components/OrderTracker'

export default function ProfilePage() {
  const user = useSelector(state => state.auth.user)
  const dispatch = useDispatch()
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery()

  return (
    <div className="bg-background min-h-screen text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Profile Header */}
        <div className="bg-card border border-gray-800 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-black font-black text-xl">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{user?.name}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm border border-accent text-accent px-4 py-2 rounded hover:bg-accent hover:text-black transition-colors font-semibold">
                Admin Panel
              </Link>
            )}
            <button onClick={() => dispatch(logout())} className="text-sm border border-gray-700 text-gray-400 px-4 py-2 rounded hover:border-red-500 hover:text-red-400 transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-lg font-bold text-accent mb-4 uppercase tracking-wider">My Orders</h2>

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 py-8">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Loading orders...
            </div>
          )}

          {isError && <p className="text-red-400 py-4">Failed to load orders. Please refresh.</p>}

          {!isLoading && !isError && (!orders || orders.length === 0) && (
            <div className="bg-card border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-500 text-lg mb-4">No orders yet</p>
              <Link to="/shop" className="bg-accent text-black font-bold px-6 py-3 rounded hover:opacity-90 text-sm">
                Start Shopping
              </Link>
            </div>
          )}

          {!isLoading && !isError && orders?.length > 0 && (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div key={order._id} className="bg-card border border-gray-800 rounded-xl p-5">
                  {/* Order header */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                      <p className="font-mono text-sm text-text-primary">#{order._id?.slice(-10).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Date</p>
                      <p className="text-sm text-text-primary">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Total</p>
                      <p className="text-sm font-bold text-accent">${order.totalPrice?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Payment</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                        {order.isPaid ? '✓ Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  {order.orderItems?.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-400">
                          <span>{item.name} — Size {item.size} × {item.qty}</span>
                          <span>${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping + Payment info */}
                  <div className="flex flex-wrap gap-6 mb-4 text-xs border-t border-gray-800 pt-4">
                    {order.shippingAddress && (
                      <div>
                        <p className="text-gray-600 uppercase tracking-wider mb-1">Ship To</p>
                        <p className="text-gray-400">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-400">{order.shippingAddress.street}</p>
                        <p className="text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p className="text-gray-400">{order.shippingAddress.phone}</p>
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div>
                        <p className="text-gray-600 uppercase tracking-wider mb-1">Payment</p>
                        <p className="text-gray-400">{order.paymentMethod}</p>
                        {order.manualPayment?.transactionId && (
                          <p className="text-gray-500">TXN: {order.manualPayment.transactionId}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tracker */}
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tracking Status</p>
                    <OrderTracker trackingStatus={order.trackingStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
