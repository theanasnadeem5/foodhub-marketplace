import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, Clock, Bike, Plus, Minus, ShoppingCart, ChefHat, Leaf } from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function VendorDetail() {
  const { id }                   = useParams()
  const [vendor, setVendor]      = useState(null)
  const [menu,   setMenu]        = useState({})
  const [loading, setLoading]    = useState(true)
  const [activecat, setActivecat]= useState('')
  const { addToCart, removeFromCart, cart } = useCart()
  const { show }  = useToast()
  const { user }  = useAuth()

  useEffect(() => {
    api.get(`/vendors/${id}`).then(res => {
      setVendor(res.data.data.vendor)
      setMenu(res.data.data.menu)
      setActivecat(Object.keys(res.data.data.menu)[0] || '')
    }).finally(() => setLoading(false))
  }, [id])

  const getItemQty = itemId => {
    const vc = cart.find(c => c.vendorId === id)
    const it = vc?.items.find(i => i.menuItemId === itemId)
    return it?.quantity || 0
  }

  const handleAdd = item => {
    if (!user) { show('Please login to add items', 'error'); return }
    addToCart(vendor, item)
    show(`${item.name} added to cart 🛒`, 'success')
  }

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />
  if (!vendor) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Vendor not found</div>

  const categories = Object.keys(menu)

  return (
    <div className="page">
      {/* Banner */}
      <div style={{ height: 240, background: 'var(--gray-200)', position: 'relative', overflow: 'hidden' }}>
        {vendor.bannerUrl
          ? <img src={vendor.bannerUrl} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #FF6B35, #E55A26)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={60} color="white" style={{ opacity: 0.4 }} />
            </div>
        }
      </div>

      <div className="container">
        {/* Vendor info */}
        <div className="card" style={{ marginTop: -40, marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <div className="card-body">
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{vendor.name}</h1>
                <p style={{ color: 'var(--gray-500)', marginBottom: 12 }}>{vendor.cuisineTypes?.join(' · ')}</p>
                <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>{vendor.description}</p>
              </div>
              <span className={`badge ${vendor.isOpen ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                {vendor.isOpen ? '● Open Now' : '● Closed'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap', fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-700)' }}>
                <Star size={15} fill="var(--warning)" color="var(--warning)" />
                <strong>{vendor.ratingAvg?.toFixed(1)}</strong> ({vendor.ratingCount} reviews)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)' }}>
                <Clock size={15} /> {vendor.avgDeliveryTime} min delivery
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)' }}>
                <Bike size={15} /> {vendor.deliveryFee === 0 ? 'Free delivery' : `₹${vendor.deliveryFee} delivery`}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Category sidebar */}
          <div className="card hide-mobile" style={{ position: 'sticky', top: 80 }}>
            <div className="card-body" style={{ padding: 8 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActivecat(cat)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                    background: activecat === cat ? 'var(--primary-light)' : 'transparent',
                    color:      activecat === cat ? 'var(--primary)' : 'var(--gray-600)',
                    transition: 'var(--transition)'
                  }}>
                  {cat} <span style={{ float: 'right', color: 'var(--gray-400)', fontSize: 12 }}>
                    {menu[cat]?.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--gray-100)' }}>
                  {cat}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {menu[cat]?.map(item => (
                    <div key={item._id} className="card">
                      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            {item.isVeg
                              ? <span title="Veg" style={{ width: 16, height: 16, border: '2px solid var(--success)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /></span>
                              : <span title="Non-veg" style={{ width: 16, height: 16, border: '2px solid var(--danger)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} /></span>
                            }
                            <h3 style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</h3>
                            {item.isFeatured && <span className="badge badge-primary" style={{ fontSize: 10 }}>⭐ Popular</span>}
                          </div>
                          {item.description && <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>{item.description}</p>}
                          <strong style={{ fontSize: 16, color: 'var(--gray-800)' }}>₹{item.price}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name}
                              style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 10 }} />
                          )}
                          {getItemQty(item._id) === 0 ? (
                            <button className="btn btn-outline btn-sm" onClick={() => handleAdd(item)}
                              disabled={!vendor.isOpen}>
                              <Plus size={14} /> Add
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button className="btn btn-sm" style={{ background: 'var(--primary)', color: 'white', width: 30, height: 30, padding: 0, borderRadius: 8 }}
                                onClick={() => removeFromCart(vendor._id, item._id)}>
                                <Minus size={13} />
                              </button>
                              <span style={{ fontWeight: 700, fontSize: 15, minWidth: 16, textAlign: 'center' }}>
                                {getItemQty(item._id)}
                              </span>
                              <button className="btn btn-sm" style={{ background: 'var(--primary)', color: 'white', width: 30, height: 30, padding: 0, borderRadius: 8 }}
                                onClick={() => handleAdd(item)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
