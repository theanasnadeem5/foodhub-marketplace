import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'

// Pages
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import VendorDetail  from './pages/VendorDetail'
import Cart          from './pages/Cart'
import OrderSuccess  from './pages/OrderSuccess'
import OrderHistory  from './pages/OrderHistory'
import OrderDetail   from './pages/OrderDetail'
import VendorDash    from './pages/vendor/VendorDashboard'
import VendorMenu    from './pages/vendor/VendorMenu'
import VendorOrders  from './pages/vendor/VendorOrders'
import AdminDash     from './pages/admin/AdminDashboard'
import AdminVendors  from './pages/admin/AdminVendors'
import AdminOrders   from './pages/admin/AdminOrders'
import AdminUsers    from './pages/admin/AdminUsers'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />

        <Route path="/cart" element={
          <ProtectedRoute roles={['CUSTOMER','SUPER_ADMIN']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/order-success/:id" element={
          <ProtectedRoute><OrderSuccess /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute roles={['CUSTOMER','SUPER_ADMIN']}>
            <OrderHistory />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute><OrderDetail /></ProtectedRoute>
        } />

        {/* Vendor */}
        <Route path="/vendor" element={
          <ProtectedRoute roles={['VENDOR_MANAGER','SUPER_ADMIN']}>
            <VendorDash />
          </ProtectedRoute>
        } />
        <Route path="/vendor/menu" element={
          <ProtectedRoute roles={['VENDOR_MANAGER','SUPER_ADMIN']}>
            <VendorMenu />
          </ProtectedRoute>
        } />
        <Route path="/vendor/orders" element={
          <ProtectedRoute roles={['VENDOR_MANAGER','SUPER_ADMIN']}>
            <VendorOrders />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminDash />
          </ProtectedRoute>
        } />
        <Route path="/admin/vendors" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminVendors />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
