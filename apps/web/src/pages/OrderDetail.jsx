import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChefHat, MapPin, Clock } from 'lucide-react'
import api from '../services/api'

const STATUS_STEPS = ['PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED']
const STATUS_LABELS = { PENDING:'Received',CONFIRMED:'Confirmed',PREPARING:'Preparing',READY:'Ready',OUT_FOR_DELIVERY:'On the way',DELIVERED:'Delivered',CANCELLED:'Cancelled' }

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data))
  }, [id])

  if (!order) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Link to="/orders" style={{ color: 'var(--gray-400)', fontSize: 14 }}>← Orders</Link>
          <span style={{ color: 'var(--gray-300)' }}>/</span>
          <span style={{ fontSize: 14, color: 'var(--gray-600)', fontWeight: 600 }}>#{order.orderNumber}</span>
        </div>

        {order.vendorOrders.map(vo => {
          const stepIdx = STATUS_STEPS.indexOf(vo.status)
          return (
            <div key={vo._id} className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChefHat size={15} color="var(--primary)" />
                  <strong>{vo.vendorName}</strong>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: vo.status === 'DELIVERED' ? 'var(--success)' : vo.status === 'CANCELLED' ? 'var(--danger)' : 'var(--primary)' }}>
                  {STATUS_LABELS[vo.status]}
                </span>
              </div>
              <div className="card-body">
                {/* Progress bar */}
                {vo.status !== 'CANCELLED' && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? 'var(--primary)' : 'var(--gray-200)', transition: 'var(--transition)' }} />
                    ))}
                  </div>
                )}
                {vo.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: i < vo.items.length-1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--gray-500)', fontSize: 13 }}>
                  <Clock size={13} /> Est. {vo.estimatedMinutes} min
                </div>
              </div>
            </div>
          )
        })}

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--gray-600)' }}>
              <MapPin size={15} />
              <span style={{ fontSize: 14 }}>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</span>
            </div>
            {[['Subtotal', `₹${order.subtotal}`],['Delivery', `₹${order.deliveryFeeTotal}`],['Tax (5%)', `₹${order.taxAmount}`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-500)', marginBottom:6 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 10, color: 'var(--primary)' }}>
              <span>Total</span><span>₹{order.grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
