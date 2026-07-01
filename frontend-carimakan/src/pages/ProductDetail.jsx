import { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

import { useFoodDetail } from '../hooks/useFoods'
import { mapFoodToProduct } from '../utils/mapFood'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'

/* ─── Star Rating Input ─── */
function StarInput({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: '1.5rem',
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= (hover || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

/* ─── Static star display ─── */
function StarDisplay({ value, size = '1rem' }) {
  const rounded = Math.round(value)
  return (
    <span style={{ fontSize: size, color: '#f59e0b', letterSpacing: 1 }}>
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  )
}

/* ─── Review Card ─── */
function ReviewCard({ rating }) {
  return (
    <div
      style={{
        background: 'white', borderRadius: 12, padding: '14px 18px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937' }}>
            {rating.user?.name || 'Pengguna'}
          </div>
          <StarDisplay value={rating.rating} size="0.9rem" />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          {new Date(rating.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </div>
      {rating.review && (
        <p style={{ marginTop: 8, color: '#4b5563', fontSize: '0.88rem', lineHeight: 1.6 }}>
          {rating.review}
        </p>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
function ProductDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)
  const { food, loading, error } = useFoodDetail(id)
  const product = mapFoodToProduct(food)

  // Rating state
  const [reviews, setReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState(null)
  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState('')
  const [ratingSuccess, setRatingSuccess] = useState(false)

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // Tambah ke keranjang
  const handleAddToCart = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu.')
      return
    }
    try {
      await addToCart(product)
      alert('Berhasil ditambahkan ke keranjang!')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang')
    }
  }

  // Fetch reviews & summary
  const fetchReviews = async () => {
    if (!id) return
    try {
      const [reviewRes, summaryRes] = await Promise.all([
        api.get(`/ratings/food/${id}`),
        api.get(`/ratings/food/${id}/summary`),
      ])
      setReviews(reviewRes.data.data)
      setRatingSummary(summaryRes.data.data)
    } catch {
      // silent
    }
  }

  // Fetch user's existing rating & favorite status
  const fetchUserData = async () => {
    if (!user || !id) return
    try {
      const [myRatingRes, favRes] = await Promise.all([
        api.get(`/ratings/food/${id}/user`),
        api.get(`/favorites/check/${id}`),
      ])
      if (myRatingRes.data.data?.hasRated) {
        setMyRating(myRatingRes.data.data.rating?.rating || 0)
        setMyReview(myRatingRes.data.data.rating?.review || '')
      }
      setIsFavorite(favRes.data.data.isFavorite)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  // Submit rating
  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (!user) { alert('Silakan login dulu.'); return }
    if (myRating === 0) { setRatingError('Pilih bintang terlebih dahulu.'); return }
    setRatingLoading(true)
    setRatingError('')
    setRatingSuccess(false)
    try {
      await api.post('/ratings', { foodId: parseInt(id), rating: myRating, review: myReview })
      setRatingSuccess(true)
      await fetchReviews()
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Gagal menyimpan rating')
    } finally {
      setRatingLoading(false)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) { alert('Silakan login dulu.'); return }
    setFavLoading(true)
    try {
      const res = await api.post('/favorites/toggle', { foodId: parseInt(id) })
      setIsFavorite(res.data.data.isFavorite)
    } catch {
      // silent
    } finally {
      setFavLoading(false)
    }
  }

  /* ─── Loading / Error ─── */
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
        Memuat detail menu...
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>😕</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Produk tidak ditemukan</h1>
        <Link to="/menu" style={{ color: '#c90045', marginTop: 12, display: 'inline-block' }}>
          ← Kembali ke Menu
        </Link>
      </div>
    )
  }

  /* ─── Main Render ─── */
  const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '10px 14px', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Product Info ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start', marginBottom: 48 }}
        className="product-grid"
      >
        {/* Gambar */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: 20, objectFit: 'cover', maxHeight: 420 }}
          />
          {/* Tombol Favorit */}
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 44, height: 44, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              fontSize: '1.3rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s',
              transform: isFavorite ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Info */}
        <div>
          <Link to="/menu" style={{ color: '#9ca3af', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Menu
          </Link>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1f2937', marginTop: 8, marginBottom: 4 }}>
            {product.name}
          </h1>

          {product.storeName && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 12 }}>
              🏪 Dijual oleh <strong>{product.storeName}</strong>
            </p>
          )}

          {/* Rating summary */}
          {ratingSummary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <StarDisplay value={ratingSummary.average} size="1.1rem" />
              <span style={{ fontWeight: 700, color: '#1f2937' }}>
                {ratingSummary.average.toFixed(1)}
              </span>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                ({ratingSummary.count} ulasan)
              </span>
            </div>
          )}

          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c90045', marginBottom: 16 }}>
            Rp {product.price.toLocaleString('id-ID')}
          </p>

          {/* Status stok */}
          <div style={{
            display: 'inline-block',
            padding: '4px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600,
            background: product.stock > 0 ? '#d1fae5' : '#fee2e2',
            color: product.stock > 0 ? '#065f46' : '#991b1b',
            marginBottom: 18,
          }}>
            {product.stock > 0 ? `✓ Tersedia (${product.stock} stok)` : '✗ Stok Habis'}
          </div>

          <p style={{ color: '#4b5563', lineHeight: 1.8, marginBottom: 24, fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Tombol tambah ke keranjang */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 12, border: 'none', cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              background: product.stock > 0 ? 'linear-gradient(135deg, #c90045, #ff3370)' : '#e5e7eb',
              color: product.stock > 0 ? 'white' : '#9ca3af',
              fontWeight: 700, fontSize: '1rem',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => product.stock > 0 && (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {product.stock > 0 ? '🛒 Tambah ke Keranjang' : 'Stok Habis'}
          </button>
        </div>
      </div>

      {/* ── Rating & Review Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="review-grid">

        {/* Kiri: form beri rating */}
        <div
          style={{
            background: 'white', borderRadius: 16, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937', marginBottom: 16 }}>
            ⭐ Beri Ulasan
          </h2>

          {!user ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
              <Link to="/login" style={{ color: '#c90045', fontWeight: 600 }}>Login</Link>
              {' '}untuk memberi ulasan
            </div>
          ) : (
            <form onSubmit={handleSubmitRating}>
              {ratingError && (
                <div style={{
                  background: '#fee2e2', color: '#991b1b', borderRadius: 8,
                  padding: '8px 14px', fontSize: '0.85rem', marginBottom: 12,
                }}>
                  {ratingError}
                </div>
              )}
              {ratingSuccess && (
                <div style={{
                  background: '#d1fae5', color: '#065f46', borderRadius: 8,
                  padding: '8px 14px', fontSize: '0.85rem', marginBottom: 12,
                }}>
                  ✅ Ulasan berhasil disimpan!
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8 }}>
                  Rating kamu
                </label>
                <StarInput value={myRating} onChange={setMyRating} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Tulis ulasan (opsional)
                </label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  placeholder="Bagaimana rasanya?"
                  onFocus={(e) => (e.target.style.borderColor = '#c90045')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              <button
                type="submit"
                disabled={ratingLoading || myRating === 0}
                style={{
                  width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                  background: myRating > 0 ? 'linear-gradient(135deg, #c90045, #ff3370)' : '#e5e7eb',
                  color: myRating > 0 ? 'white' : '#9ca3af',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: myRating > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {ratingLoading ? 'Menyimpan...' : 'Kirim Ulasan'}
              </button>
            </form>
          )}
        </div>

        {/* Kanan: daftar review */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937', marginBottom: 16 }}>
            💬 Ulasan Pembeli
            {ratingSummary && (
              <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
                ({ratingSummary.count} ulasan)
              </span>
            )}
          </h2>

          {/* Distribusi bintang */}
          {ratingSummary && ratingSummary.count > 0 && (
            <div style={{
              background: 'white', borderRadius: 12, padding: 16,
              boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 16,
            }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingSummary.distribution[star] || 0
                const pct = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : 0
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', width: 16 }}>{star}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 8 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 999,
                        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                        transition: 'width 0.4s',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af', width: 24 }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Review list */}
          <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                Belum ada ulasan. Jadilah yang pertama! 🙌
              </div>
            ) : (
              reviews.map((r) => <ReviewCard key={r.id} rating={r} />)
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid, .review-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  )
}

export default ProductDetail
