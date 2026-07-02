import { useContext, useState, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import PaymentGateway from '../components/PaymentGateway'

/* ─── Helper ─── */
const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const generateOrderId = () => 'ORD-' + Date.now().toString().slice(-8).toUpperCase()

/* ─── Struk Modal ─── */
function ReceiptModal({ order, onClose }) {
  const receiptRef = useRef()

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML
    const win = window.open('', '_blank', 'width=420,height=700')
    win.document.write(`
      <html>
        <head>
          <title>Struk Pembelian - ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; color: #111; }
            .receipt { max-width: 360px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .logo { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 4px; }
            .total-row { font-size: 15px; font-weight: bold; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%', maxWidth: 440,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header modal */}
        <div
          style={{
            background: 'linear-gradient(135deg, #c90045, #ff3370)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 24px 20px',
            textAlign: 'center', color: 'white',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🎉</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Pembayaran Berhasil!</h2>
          <p style={{ opacity: 0.85, marginTop: 4, fontSize: '0.88rem' }}>
            Pesanan kamu sedang diproses
          </p>
        </div>

        {/* Struk area */}
        <div style={{ padding: '20px 24px' }}>
          <div
            ref={receiptRef}
            style={{
              fontFamily: "'Courier New', monospace",
              background: '#fafafa',
              border: '1px dashed #d1d5db',
              borderRadius: 12,
              padding: '20px',
            }}
          >
            {/* Logo */}
            <div className="logo" style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c90045' }}>🍎 Foody</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                Platform Pesan Makan Online
              </div>
            </div>

            <div className="divider" style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />

            {/* Info pesanan */}
            <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 6 }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#6b7280' }}>No. Pesanan</span>
                <span style={{ fontWeight: 700 }}>{order.orderId}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#6b7280' }}>Tanggal</span>
                <span>{order.date}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#6b7280' }}>Pembeli</span>
                <span>{order.customerName}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#6b7280' }}>Pembayaran</span>
                <span>{order.payment}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#6b7280' }}>Alamat</span>
                <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.address}</span>
              </div>
            </div>

            <div className="divider" style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />

            {/* Item list */}
            <div style={{ fontSize: '0.82rem', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#111827' }}>Detail Pesanan</div>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> x{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>{formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="divider" style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />

            {/* Biaya */}
            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#6b7280' }}>
                <span>Subtotal</span>
                <span>{formatRp(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#6b7280' }}>
                <span>Biaya Pengiriman</span>
                <span>{formatRp(order.deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#6b7280' }}>
                <span>Biaya Layanan</span>
                <span>{formatRp(order.serviceFee)}</span>
              </div>
            </div>

            <div className="divider" style={{ borderTop: '2px solid #374151', margin: '10px 0' }} />

            {/* Total */}
            <div
              className="total-row"
              style={{
                display: 'flex', justifyContent: 'space-between',
                fontWeight: 800, fontSize: '1rem', color: '#c90045',
              }}
            >
              <span>TOTAL</span>
              <span>{formatRp(order.total)}</span>
            </div>

            <div className="divider" style={{ borderTop: '1px dashed #9ca3af', margin: '10px 0' }} />

            {/* Footer struk */}
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.7 }}>
              <div>Status: <span style={{ color: '#10b981', fontWeight: 700 }}>✓ LUNAS</span></div>
              <div style={{ marginTop: 6 }}>Terima kasih telah memesan di Foody!</div>
              <div>Selamat menikmati 🍽️</div>
            </div>
          </div>

          {/* Tombol aksi */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={handlePrint}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: '2px solid #c90045',
                background: 'white',
                color: '#c90045',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🖨️ Cetak Struk
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #c90045, #ff3370)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Selesai ✓
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
    </div>
  )
}

/* ─── Checkout Page ─── */
function Checkout() {
  const { user } = useContext(AuthContext)
  const { cartItems, totalPrice, clearCart } = useContext(CartContext)
  const navigate = useNavigate()

  const [address, setAddress] = useState(user?.address || '')
  const [payment, setPayment] = useState('Transfer Bank')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)   // null = belum bayar, obj = tampilkan struk
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)

  if (!user) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  }

  const DELIVERY_FEE = 5000
  const SERVICE_FEE = 2000
  const grandTotal = totalPrice + DELIVERY_FEE + SERVICE_FEE

  // Buka modal payment gateway simulasi
  const handlePayment = () => {
    if (cartItems.length === 0 || !address.trim()) return
    setShowPaymentGateway(true)
  }

  // Callback setelah simulasi payment gateway selesai
  const handlePaymentGatewayComplete = async () => {
    setShowPaymentGateway(false)
    setSubmitting(true)
    try {
      const orderData = {
        orderId: generateOrderId(),
        date: new Date().toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        customerName: user.name,
        address: address.trim(),
        payment,
        notes: notes.trim(),
        items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal: totalPrice,
        deliveryFee: DELIVERY_FEE,
        serviceFee: SERVICE_FEE,
        total: grandTotal,
      }

      await clearCart()
      setReceipt(orderData)
    } catch {
      alert('Gagal memproses pembayaran. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseReceipt = () => {
    setReceipt(null)
    navigate('/')
  }

  /* ─── UI ─── */
  const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '10px 14px', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', color: '#1f2937',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <>
      {receipt && <ReceiptModal order={receipt} onClose={handleCloseReceipt} />}

      {showPaymentGateway && (
        <PaymentGateway
          paymentMethod={payment}
          total={grandTotal}
          address={address}
          onComplete={handlePaymentGatewayComplete}
          onCancel={() => setShowPaymentGateway(false)}
        />
      )}

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>
          🛍️ Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '2.5rem' }}>🛒</div>
            <p style={{ marginTop: 8 }}>Keranjang kosong. Tambahkan menu terlebih dahulu.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

            {/* Kiri: form */}
            <div
              style={{
                background: 'white', borderRadius: 16,
                padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 16 }}>
                📍 Detail Pengiriman
              </h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Nama Penerima
                </label>
                <input
                  style={{ ...inputStyle, background: '#f9fafb', cursor: 'not-allowed' }}
                  value={user.name}
                  readOnly
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Alamat Pengiriman <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap..."
                  onFocus={(e) => (e.target.style.borderColor = '#c90045')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Metode Pembayaran
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: '🏦 Transfer Bank', val: 'Transfer Bank' },
                    { label: '💳 E-Wallet', val: 'E-Wallet' },
                    { label: '💵 COD', val: 'COD' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setPayment(p.val)}
                      style={{
                        padding: '10px 8px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600,
                        border: '2px solid', cursor: 'pointer', transition: 'all 0.2s',
                        borderColor: payment === p.val ? '#c90045' : '#e5e7eb',
                        background: payment === p.val ? '#fce7f3' : 'white',
                        color: payment === p.val ? '#c90045' : '#6b7280',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Catatan (opsional)
                </label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: tidak pakai sambal, dll."
                  onFocus={(e) => (e.target.style.borderColor = '#c90045')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            </div>

            {/* Kanan: ringkasan */}
            <div
              style={{
                background: 'white', borderRadius: 16,
                padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: 16 }}>
                🧾 Ringkasan Pesanan
              </h2>

              <div style={{ marginBottom: 16 }}>
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {item.image && (
                        <img
                          src={item.image} alt={item.name}
                          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>{item.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#9ca3af' }}>x{item.quantity}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>
                      {formatRp(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Biaya detail */}
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Subtotal</span><span>{formatRp(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Biaya Pengiriman</span><span>{formatRp(DELIVERY_FEE)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Biaya Layanan</span><span>{formatRp(SERVICE_FEE)}</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '2px solid #f3f4f6', marginTop: 12, paddingTop: 12,
                  display: 'flex', justifyContent: 'space-between', fontWeight: 800,
                  fontSize: '1.1rem', color: '#c90045',
                }}
              >
                <span>Total</span>
                <span>{formatRp(grandTotal)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={submitting || !address.trim()}
                style={{
                  width: '100%', marginTop: 20,
                  padding: '14px',
                  borderRadius: 12, border: 'none',
                  background: submitting || !address.trim()
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #c90045, #ff3370)',
                  color: submitting || !address.trim() ? '#9ca3af' : 'white',
                  fontWeight: 700, fontSize: '1rem',
                  cursor: submitting || !address.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {submitting ? (
                  <>⏳ Memproses...</>
                ) : (
                  <>💳 Bayar {formatRp(grandTotal)}</>
                )}
              </button>

              {!address.trim() && (
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#ef4444', marginTop: 8 }}>
                  ⚠️ Isi alamat pengiriman terlebih dahulu
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  )
}

export default Checkout
