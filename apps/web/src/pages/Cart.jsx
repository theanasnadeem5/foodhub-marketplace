import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ChefHat } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../services/api'

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, totalPrice } = useCart()
  const { user }       = useAuth()
  const { show }       = useToast()
  const navigate       = useNavigate()
  const [address, setAddress] = useState({ street: '', city: '', postalCode: '' })
  const [loading, setLoading] = useState(false)

  const tax      = +(totalPrice * 0.05).toFixed(2)
  const grandTotal = +(totalPrice + tax).toFixed(2)

  const placeOrder = async () => {
    if (!address.street || !address.city) { show('Please enter delivery address', 'error'); return }
    setLoading(true)
    try {
      const cartItems = cart.map(c => ({
        vendorId:    c.vendorId,
        vendorName:  c.vendorName,
        deliveryFee: c.deliveryFee,
        items: c.items.map(i => ({
          menuItemId: i.menuItemId,
          name:       i.name,
          price:      i.price,
          quantity:   i.quantity,
          imageUrl:   i.imageUrl
        }))
      }))
      const res = await api.post('/orders', { cartItems, deliveryAddress: address })
      clearCart()
      show('Order placed successfully! 🎉', 'success')
      navigate(`/order-success/${res.data.data._id}`)
    } catch (err) {
      show(err.response?.data?.message || 'Failed to place order', 'error')
    } finally { setLoading(false) }
  }

  if (cart.length === 0) return (
    <div className="page-content container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <ShoppingCart size={64} style={{ color: 'var(--gray-300)', margin: '0 auto 16px' }} />
      <h2 style={{ color: 'var(--gray-500)', marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Add items from a restaurant to get started</p>
      <Link to="/" className="btn btn-primary">Browse Restaurants</Link>
    </div>
  )

  return (
    <div className="page-content">
      <div className="container">
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Your Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {cart.map(vc => (
              <div key={vc.vendorId} className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ChefHat size={16} color="var(--primary)" />
                  <strong style={{ fontSize: 15 }}>{vc.vendorName}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-500)' }}>
                    Delivery: {vc.deliveryFee === 0 ? 'Free' : `₹${vc.deliveryFee}`}
                  </span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {vc.items.map(item => (
                    <div key={item.menuItemId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 8 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>₹{item.price} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button className="btn btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: 7, background: 'var(--gray-100)' }}
                          onClick={() => removeFromCart(vc.vendorId, item.menuItemId)}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                        <button className="btn btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: 7, background: 'var(--primary)', color: 'white' }}
                          onClick={() => addToCart({ _id: vc.vendorId, name: vc.vendorName, deliveryFee: vc.deliveryFee }, item)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <strong style={{ minWidth: 60, textAlign: 'right' }}>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Delivery address */}
            <div className="card">
              <div className="card-header"><strong>Delivery Address</strong></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Street / Area</label>
                  <input className="form-input" placeholder="e.g. 12 Park Street, Salt Lake"
                    value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="Kolkata"
                      value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" placeholder="700001"
                      value={address.postalCode} onChange={e => setAddress(p => ({ ...p, postalCode: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-header"><strong>Order Summary</strong></div>
            <div className="card-body">
              {cart.map(vc => (
                <div key={vc.vendorId} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 6 }}>{vc.vendorName}</div>
                  {vc.items.map(i => (
                    <div key={i.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                    <span>Delivery</span>
                    <span>{vc.deliveryFee === 0 ? 'Free' : `₹${vc.deliveryFee}`}</span>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-500)', marginBottom: 6 }}>
                  <span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
                  <span>Tax (5% GST)</span><span>₹{tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
                  <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                </div>
              </div>
              <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 10, fontSize: 13, color: 'var(--primary)', fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
                🎭 Demo Mode — No real payment
              </div>
              <button className="btn btn-primary w-full btn-lg" onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing order…' : `Place Order · ₹${grandTotal}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
