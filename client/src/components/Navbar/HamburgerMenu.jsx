import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import Logo from '../Logo'

export default function HamburgerMenu({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const token = useSelector(state => state.auth.token)
  const handleLogout = () => { dispatch(logout()); onClose() }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-card z-50 flex flex-col p-6 gap-6 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button onClick={onClose} className="text-text-primary hover:text-accent transition-colors" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <Link to="/"     onClick={onClose} className="text-text-primary hover:text-accent transition-colors text-lg">Home</Link>
          <Link to="/shop" onClick={onClose} className="text-text-primary hover:text-accent transition-colors text-lg">Shop</Link>
          <Link to={token ? '/profile' : '/login'} onClick={onClose} className="text-text-primary hover:text-accent transition-colors text-lg">
            {token ? 'Profile' : 'Login'}
          </Link>
        </nav>
        {token && (
          <button onClick={handleLogout} className="mt-auto text-text-primary hover:text-accent transition-colors border border-gray-700 px-4 py-2 rounded text-sm">
            Logout
          </button>
        )}
      </div>
    </>
  )
}
