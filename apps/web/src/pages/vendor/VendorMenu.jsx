import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import api from '../../services/api'

const EMPTY = { name:'', category:'', description:'', price:'', imageUrl:'', isVeg:false, isFeatured:false }

export default function VendorMenu() {
  const { user }  = useAuth()
  const { show }  = useToast()
  const vendorId  = user?.vendorId
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const fetchMenu = () => {
    api.get(`/menu/${vendorId}`).then(r => setItems(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { if (vendorId) fetchMenu() }, [vendorId])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = item => { setForm({ name:item.name, category:item.category, description:item.description||'', price:item.price, imageUrl:item.imageUrl||'', isVeg:item.isVeg, isFeatured:item.isFeatured }); setEditing(item._id); setModal(true) }

  const save = async () => {
    if (!form.name || !form.category || !form.price) { show('Name, category and price are required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/menu/${vendorId}/items/${editing}`, { ...form, price: Number(form.price) })
        show('Item updated ✅', 'success')
      } else {
        await api.post(`/menu/${vendorId}`, { ...form, price: Number(form.price) })
        show('Item added ✅', 'success')
      }
      setModal(false); fetchMenu()
    } catch (err) { show(err.response?.data?.message || 'Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Remove this item?')) return
    await api.delete(`/menu/${vendorId}/items/${id}`)
    show('Item removed', 'success'); fetchMenu()
  }

  const categories = [...new Set(items.map(i => i.category))]

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Menu Manager</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>{items.length} items</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/vendor" className="btn btn-secondary btn-sm">← Dashboard</Link>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Item</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No menu items yet</h3>
            <p>Add your first item to start receiving orders</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={15} /> Add First Item</button>
          </div>
        ) : categories.map(cat => (
          <div key={cat} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--gray-700)' }}>{cat}</h2>
            <div className="grid grid-2">
              {items.filter(i => i.category === cat).map(item => (
                <div key={item._id} className="card">
                  <div className="card-body" style={{ display: 'flex', gap: 14 }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: 70, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                      : <div style={{ width: 70, height: 56, background: 'var(--gray-100)', borderRadius: 10, flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 6 }}>{item.description}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <strong style={{ color: 'var(--primary)', fontSize: 16 }}>₹{item.price}</strong>
                            {item.isVeg && <span className="badge badge-success" style={{ fontSize: 10 }}>Veg</span>}
                            {item.isFeatured && <span className="badge badge-primary" style={{ fontSize: 10 }}>⭐ Featured</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)} style={{ padding: '5px 10px' }}><Pencil size={13} /></button>
                          <button className="btn btn-sm" style={{ padding: '5px 10px', background: '#FEE2E2', color: 'var(--danger)' }} onClick={() => remove(item._id)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{editing ? 'Edit Item' : 'Add New Item'}</strong>
              <button onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="card-body">
              {[
                { key:'name',        label:'Item Name *',     type:'text',   placeholder:'e.g. Chicken Biryani' },
                { key:'category',    label:'Category *',      type:'text',   placeholder:'e.g. Biryani, Pizza, Drinks' },
                { key:'price',       label:'Price (₹) *',     type:'number', placeholder:'e.g. 249' },
                { key:'description', label:'Description',     type:'text',   placeholder:'Short description' },
                { key:'imageUrl',    label:'Image URL',       type:'url',    placeholder:'https://images.unsplash.com/...' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                {[['isVeg','🟢 Vegetarian'],['isFeatured','⭐ Featured']].map(([k,l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    {l}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : <><Check size={15} /> {editing ? 'Save Changes' : 'Add to Menu'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
