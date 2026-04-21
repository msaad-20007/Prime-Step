import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar/Navbar'
import CartDrawer from './components/CartDrawer/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar onCartOpen={() => setIsCartOpen(true)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
