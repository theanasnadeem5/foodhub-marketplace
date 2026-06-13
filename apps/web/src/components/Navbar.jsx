import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, LayoutDashboard, ChefHat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems }   = useCart()
  const navigate         = useNavigate()

  return (
    <header className="page-header">
      <div className="container flex items-center justify-between">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={20} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>
            Food<span style={{ color: 'var(--primary)' }}>Hub</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              {user.role === 'SUPER_ADMIN' && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={15} /> Admin
                </Link>
              )}
              {user.role === 'VENDOR_MANAGER' && (
                <Link to="/vendor" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              )}
              {user.role === 'CUSTOMER' && (
                <Link to="/orders" className="btn btn-secondary btn-sm">
                  <User size={15} /> Orders
                </Link>
              )}
              <Link to="/cart" className="btn btn-primary btn-sm" style={{ position: 'relative' }}>
                <ShoppingCart size={15} /> Cart
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -8, right: -8,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '50%', width: 20, height: 20,
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{totalItems}</span>
                )}
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
