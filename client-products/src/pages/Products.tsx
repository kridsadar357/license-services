import { useState, useEffect } from 'react'
import { productsApi } from '../api'

interface Product {
  id: number
  name: string
  description?: string
  productId: string
  enabled: boolean
  createdAt: string
  updatedAt?: string
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', productId: '' })

  useEffect(() => {
    loadProducts()
  }, [search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getAll(search || undefined)
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({ name: '', description: '', productId: '' })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      productId: product.productId,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Product name is required')
      return
    }
    if (!formData.productId.trim()) {
      alert('Product ID is required')
      return
    }
    if (formData.productId.trim().length < 3) {
      alert('Product ID must be at least 3 characters')
      return
    }

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        })
      } else {
        await productsApi.create({
          name: formData.name.trim(),
          productId: formData.productId.trim(),
          description: formData.description.trim() || undefined,
        })
      }
      setShowModal(false)
      loadProducts()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? 
                            error.response.data.errors.join(', ') : 
                            'Failed to save product')
      alert(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productsApi.delete(id)
      loadProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleToggleEnabled = async (product: Product) => {
    try {
      await productsApi.update(product.id, { enabled: !product.enabled })
      loadProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update product')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Products Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>+ Add Product</button>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '20px' }}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Product ID</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td><code>{product.productId}</code></td>
                  <td>{product.description || '-'}</td>
                  <td>
                    <span className={`badge ${product.enabled ? 'badge-success' : 'badge-danger'}`}>
                      {product.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(product)}>Edit</button>
                    <button
                      className={`btn ${product.enabled ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleToggleEnabled(product)}
                    >
                      {product.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <label>Product ID</label>
            <input
              type="text"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              disabled={!!editingProduct}
            />
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products

