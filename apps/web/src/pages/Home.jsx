import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, Bike, ChefHat, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function Home() {
  const [vendors,  setVendors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [cuisine,  setCuisine]  = useState('')

  const CUISINES = ['All','Italian','Pizza','Indian','Biryani','Chinese','Burgers']

  useEffect(() => { fetchVendors() }, [search, cuisine])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)  params.search  = search
      if (cuisine && cuisine !== 'All') params.cuisine = cuisine
      const res = await api.get('/vendors', { params })
      setVendors(res.data.data.vendors)
    } catch { setVendors([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E55A26 100%)', padding: '60px 0 80px', marginBottom: -40 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
            <ChefHat size={14} color="white" />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>100+ restaurants near you</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
            Delicious food,<br />delivered fast 🚀
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 32 }}>
            Order from multiple restaurants in one single checkout
          </p>
          <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 48, paddingRight: 16, height: 52, fontSize: 16, borderRadius: 100, border: 'none', boxShadow: 'var(--shadow-lg)' }}
              placeholder="Search restaurants or cuisines…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Cuisine filter */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
            {CUISINES.map(c => (
              <button key={c}
                onClick={() => setCuisine(c === 'All' ? '' : c)}
                className="btn btn-sm"
                style={{
                  borderRadius: 100, whiteSpace: 'nowrap',
                  background: (cuisine === c || (!cuisine && c === 'All')) ? 'var(--primary)' : 'var(--white)',
                  color:      (cuisine === c || (!cuisine && c === 'All')) ? 'white' : 'var(--gray-600)',
                  border:     '1.5px solid var(--gray-200)',
                  flexShrink: 0
                }}>
                {c}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
            {search ? `Results for "${search}"` : 'All Restaurants'}
            <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: 16, marginLeft: 10 }}>
              ({vendors.length})
            </span>
          </h2>

          {loading ? (
            <div className="spinner" />
          ) : vendors.length === 0 ? (
            <div className="empty-state">
              <ChefHat size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <h3>No restaurants found</h3>
              <p>Try a different search or cuisine filter</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {vendors.map(v => <VendorCard key={v._id} vendor={v} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VendorCard({ vendor: v }) {
  return (
    <Link to={`/vendors/${v._id}`}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative', height: 160, background: 'var(--gray-100)', overflow: 'hidden' }}>
          {v.bannerUrl
            ? <img src={v.bannerUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, hsl(${v.name.charCodeAt(0)*5},70%,85%), hsl(${v.name.charCodeAt(1)*7},60%,75%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={40} color="white" style={{ opacity: 0.6 }} />
              </div>
          }
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className={`badge ${v.isOpen ? 'badge-success' : 'badge-danger'}`}>
              {v.isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
          {v.logoUrl && (
            <img src={v.logoUrl} alt="" style={{ position: 'absolute', bottom: -20, left: 16, width: 44, height: 44, borderRadius: 12, border: '3px solid white', objectFit: 'cover', background: 'white' }} />
          )}
        </div>
        <div className="card-body" style={{ paddingTop: v.logoUrl ? 28 : 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{v.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, lineHeight: 1.4 }}>
            {v.cuisineTypes?.join(' · ') || 'Multi-cuisine'}
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}>
              <Star size={13} fill="var(--warning)" color="var(--warning)" />
              <strong>{v.ratingAvg?.toFixed(1) || '4.0'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <Clock size={13} /> {v.avgDeliveryTime} min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <Bike size={13} /> {v.deliveryFee === 0 ? 'Free' : `₹${v.deliveryFee}`}
            </span>
          </div>
          {v.minOrderAmount > 0 && (
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
              Min. order ₹{v.minOrderAmount}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
