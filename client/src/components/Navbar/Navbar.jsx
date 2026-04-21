import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import HamburgerMenu from './HamburgerMenu'
import Logo from '../Logo'

export default function Navbar({ onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const location = useLocation()
  const cartCount = useSelector(state => state.cart.items.reduce((s, i) => s + i.qty, 0))
  const token = useSelector(state => state.auth.token)
  const user = useSelector(state => state.auth.user)
  const isAdmin = user?.role === 'admin'

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${location.pathname === to ? 'text-accent' : 'text-gray-400 hover:text-text-primary'}`}
    >
      {label}
    </Link>
  )

  return (
    <>
      <nav className="bg-card border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo + brand name */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <Logo size="sm" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-accent font-black tracking-widest text-base">PRIME STEP</span>
              <span className="text-gray-500 text-[10px] tracking-widest uppercase">Men's Footwear</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Home')}
            {navLink('/shop', 'Shop')}
            {isAdmin && navLink('/admin', 'Admin')}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative text-gray-400 hover:text-accent transition-colors p-1"
              aria-label="Open cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-black leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            {token ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile" className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span className="hidden lg:block">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700 px-2.5 py-1 rounded hover:border-red-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-400 hover:text-accent transition-colors">Login</Link>
                <Link to="/register" className="text-sm bg-accent text-black font-bold px-3 py-1.5 rounded hover:opacity-90 transition-opacity">Register</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-400 hover:text-accent transition-colors p-1"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
