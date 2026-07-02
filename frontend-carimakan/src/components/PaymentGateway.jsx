import { useState, useEffect, useRef } from 'react'

/* ─── Helpers ─── */
const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const randomVA = () => {
  const segments = Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000).toString()
  )
  return segments.join(' ')
}

/* ─── Bank & E-Wallet options ─── */
const BANKS = [
  { id: 'bca', name: 'BCA', color: '#003D79', icon: '🏦' },
  { id: 'bni', name: 'BNI', color: '#E84E0F', icon: '🏛️' },
  { id: 'mandiri', name: 'Mandiri', color: '#003876', icon: '🏢' },
  { id: 'bri', name: 'BRI', color: '#00529C', icon: '🏗️' },
]

const WALLETS = [
  { id: 'gopay', name: 'GoPay', color: '#00AA12', icon: '💚' },
  { id: 'ovo', name: 'OVO', color: '#4C2A86', icon: '💜' },
  { id: 'dana', name: 'DANA', color: '#108EE9', icon: '💙' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D', icon: '🧡' },
]

/* ─── Shared Styles ─── */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 9998,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
  backdropFilter: 'blur(6px)',
  animation: 'pgFadeIn 0.3s ease',
}

const modalStyle = {
  background: 'white',
  borderRadius: 20,
  width: '100%', maxWidth: 480,
  maxHeight: '92vh', overflowY: 'auto',
  boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  animation: 'pgSlideUp 0.35s ease',
}

const headerGradient = {
  background: 'linear-gradient(135deg, #c90045, #ff3370)',
  borderRadius: '20px 20px 0 0',
  padding: '22px 24px 18px',
  textAlign: 'center', color: 'white',
}

const btnPrimary = {
  width: '100%', padding: '14px',
  borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg, #c90045, #ff3370)',
  color: 'white', fontWeight: 700, fontSize: '0.95rem',
  cursor: 'pointer', transition: 'all 0.2s',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}

const btnSecondary = {
  width: '100%', padding: '12px',
  borderRadius: 12,
  border: '2px solid #e5e7eb',
  background: 'white',
  color: '#6b7280', fontWeight: 600, fontSize: '0.9rem',
  cursor: 'pointer', transition: 'all 0.2s',
}

/* ═══════════════════════════════════════════════════════════════
   STEP INDICATOR
   ═══════════════════════════════════════════════════════════════ */
function StepIndicator({ steps, current }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, padding: '16px 24px 8px',
    }}>
      {steps.map((label, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700,
              background: idx <= current ? 'linear-gradient(135deg, #c90045, #ff3370)' : '#f3f4f6',
              color: idx <= current ? 'white' : '#9ca3af',
              transition: 'all 0.3s',
            }}>
              {idx < current ? '✓' : idx + 1}
            </div>
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: idx <= current ? '#c90045' : '#9ca3af',
              whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{
              width: 32, height: 2, margin: '0 4px',
              marginBottom: 18,
              background: idx < current ? '#c90045' : '#e5e7eb',
              borderRadius: 2, transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PROCESSING ANIMATION
   ═══════════════════════════════════════════════════════════════ */
function ProcessingScreen({ message }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '50px 24px', gap: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        border: '4px solid #f3f4f6',
        borderTopColor: '#c90045',
        animation: 'pgSpin 0.8s linear infinite',
      }} />
      <div style={{
        fontSize: '1rem', fontWeight: 600, color: '#374151',
        animation: 'pgPulse 1.5s ease-in-out infinite',
      }}>{message || 'Memproses pembayaran...'}</div>
      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
        Mohon tunggu, jangan tutup halaman ini
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TRANSFER BANK FLOW
   ═══════════════════════════════════════════════════════════════ */
function TransferBankFlow({ total, onComplete, onCancel }) {
  const [step, setStep] = useState(0) // 0=pilih bank, 1=detail VA, 2=processing
  const [selectedBank, setSelectedBank] = useState(null)
  const [vaNumber] = useState(randomVA())
  const [timeLeft, setTimeLeft] = useState(300) // 5 menit
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (step === 1) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmTransfer = () => {
    clearInterval(timerRef.current)
    setStep(2)
    setTimeout(() => onComplete(), 2500)
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <>
      <StepIndicator steps={['Pilih Bank', 'Transfer', 'Proses', 'Selesai']} current={step} />
      <div style={{ padding: '8px 24px 24px' }}>
        {step === 0 && (
          <>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: 14, textAlign: 'center' }}>
              Pilih Bank Tujuan
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  style={{
                    padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                    border: '2.5px solid',
                    borderColor: selectedBank?.id === bank.id ? bank.color : '#e5e7eb',
                    background: selectedBank?.id === bank.id ? `${bank.color}0D` : 'white',
                    transition: 'all 0.2s', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{bank.icon}</div>
                  <div style={{
                    fontWeight: 700, fontSize: '0.85rem',
                    color: selectedBank?.id === bank.id ? bank.color : '#374151',
                  }}>{bank.name}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onCancel} style={btnSecondary}>Batal</button>
              <button
                onClick={() => selectedBank && setStep(1)}
                disabled={!selectedBank}
                style={{
                  ...btnPrimary,
                  opacity: selectedBank ? 1 : 0.5,
                  cursor: selectedBank ? 'pointer' : 'not-allowed',
                }}
              >
                Lanjut →
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{
              background: `${selectedBank.color}0A`,
              border: `2px solid ${selectedBank.color}30`,
              borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 4 }}>Transfer ke</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedBank.color, marginBottom: 12 }}>
                {selectedBank.icon} Bank {selectedBank.name}
              </div>

              <div style={{
                background: 'white', borderRadius: 12, padding: '14px 16px',
                border: '1px dashed #d1d5db', marginBottom: 12,
              }}>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 4 }}>Nomor Virtual Account</div>
                <div style={{
                  fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px',
                  color: '#111827', fontFamily: "'Courier New', monospace",
                }}>{vaNumber}</div>
                <button
                  onClick={handleCopy}
                  style={{
                    marginTop: 8, padding: '6px 16px', borderRadius: 8,
                    border: '1.5px solid #e5e7eb', background: copied ? '#ecfdf5' : '#f9fafb',
                    color: copied ? '#059669' : '#6b7280',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? '✅ Tersalin!' : '📋 Salin Nomor'}
                </button>
              </div>

              <div style={{
                background: '#fff7ed', borderRadius: 10, padding: '10px 14px',
                border: '1px solid #fed7aa',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600, marginBottom: 2 }}>
                  Total Pembayaran
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c2410c' }}>
                  {formatRp(total)}
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div style={{
              textAlign: 'center', marginBottom: 16,
              padding: '10px', borderRadius: 10,
              background: timeLeft < 60 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${timeLeft < 60 ? '#fecaca' : '#bbf7d0'}`,
            }}>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Selesaikan pembayaran dalam</div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Courier New', monospace",
                color: timeLeft < 60 ? '#dc2626' : '#16a34a',
              }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} style={btnSecondary}>Batal</button>
              <button onClick={handleConfirmTransfer} style={btnPrimary}>
                ✅ Konfirmasi Transfer
              </button>
            </div>
          </>
        )}

        {step === 2 && <ProcessingScreen message="Memverifikasi transfer..." />}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   E-WALLET FLOW
   ═══════════════════════════════════════════════════════════════ */
function EWalletFlow({ total, onComplete, onCancel }) {
  const [step, setStep] = useState(0) // 0=pilih wallet, 1=QR, 2=processing
  const [selectedWallet, setSelectedWallet] = useState(null)

  const handlePayNow = () => {
    setStep(2)
    setTimeout(() => onComplete(), 2500)
  }

  return (
    <>
      <StepIndicator steps={['Pilih Wallet', 'Scan QR', 'Proses', 'Selesai']} current={step} />
      <div style={{ padding: '8px 24px 24px' }}>
        {step === 0 && (
          <>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: 14, textAlign: 'center' }}>
              Pilih E-Wallet
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  style={{
                    padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                    border: '2.5px solid',
                    borderColor: selectedWallet?.id === wallet.id ? wallet.color : '#e5e7eb',
                    background: selectedWallet?.id === wallet.id ? `${wallet.color}0D` : 'white',
                    transition: 'all 0.2s', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{wallet.icon}</div>
                  <div style={{
                    fontWeight: 700, fontSize: '0.85rem',
                    color: selectedWallet?.id === wallet.id ? wallet.color : '#374151',
                  }}>{wallet.name}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onCancel} style={btnSecondary}>Batal</button>
              <button
                onClick={() => selectedWallet && setStep(1)}
                disabled={!selectedWallet}
                style={{
                  ...btnPrimary,
                  opacity: selectedWallet ? 1 : 0.5,
                  cursor: selectedWallet ? 'pointer' : 'not-allowed',
                }}
              >
                Lanjut →
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{
              textAlign: 'center', marginBottom: 16,
            }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 600, color: selectedWallet.color,
                marginBottom: 12,
              }}>
                {selectedWallet.icon} Scan QR dengan {selectedWallet.name}
              </div>

              {/* QR Code Simulasi */}
              <div style={{
                display: 'inline-block',
                background: 'white',
                borderRadius: 16,
                padding: 16,
                border: `3px solid ${selectedWallet.color}`,
                boxShadow: `0 4px 20px ${selectedWallet.color}20`,
              }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ display: 'block' }}>
                  {/* QR-like pattern */}
                  {Array.from({ length: 9 }, (_, row) =>
                    Array.from({ length: 9 }, (_, col) => {
                      const isCorner = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3)
                      const isCornerBorder = isCorner && (row === 0 || row === 2 || col === 0 || col === 2 ||
                        (row < 3 && col > 5 && (col === 6 || col === 8)) ||
                        (row > 5 && col < 3 && (row === 6 || row === 8)))
                      const isCornerCenter = (row === 1 && col === 1) || (row === 1 && col === 7) || (row === 7 && col === 1)
                      const shouldFill = isCornerBorder || isCornerCenter || Math.random() > 0.45

                      return shouldFill ? (
                        <rect
                          key={`${row}-${col}`}
                          x={col * 20}
                          y={row * 20}
                          width="18"
                          height="18"
                          rx="3"
                          fill={isCorner ? selectedWallet.color : '#1f2937'}
                          opacity={isCorner ? 1 : 0.85}
                        />
                      ) : null
                    })
                  )}
                </svg>
              </div>

              {/* Total */}
              <div style={{
                marginTop: 16,
                background: `${selectedWallet.color}0A`,
                borderRadius: 12, padding: '12px 16px',
                border: `1.5px solid ${selectedWallet.color}30`,
              }}>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Total Pembayaran</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedWallet.color }}>
                  {formatRp(total)}
                </div>
              </div>
            </div>

            <p style={{
              textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af',
              marginBottom: 16, lineHeight: 1.5,
            }}>
              Buka aplikasi <strong>{selectedWallet.name}</strong> dan scan QR Code di atas,<br />
              atau klik tombol di bawah untuk simulasi
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} style={btnSecondary}>Batal</button>
              <button onClick={handlePayNow} style={{
                ...btnPrimary,
                background: `linear-gradient(135deg, ${selectedWallet.color}, ${selectedWallet.color}CC)`,
              }}>
                {selectedWallet.icon} Simulasi Bayar
              </button>
            </div>
          </>
        )}

        {step === 2 && <ProcessingScreen message={`Menghubungi ${selectedWallet.name}...`} />}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COD FLOW
   ═══════════════════════════════════════════════════════════════ */
function CODFlow({ total, address, onComplete, onCancel }) {
  const [step, setStep] = useState(0) // 0=confirm, 1=processing

  const handleConfirmCOD = () => {
    setStep(1)
    setTimeout(() => onComplete(), 2000)
  }

  return (
    <>
      <StepIndicator steps={['Konfirmasi', 'Proses', 'Selesai']} current={step} />
      <div style={{ padding: '8px 24px 24px' }}>
        {step === 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🚚</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Cash on Delivery
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
                Siapkan uang tunai saat pesanan tiba.<br />
                Kurir akan menghubungi Anda sebelum pengantaran.
              </p>
            </div>

            {/* Info box */}
            <div style={{
              background: '#f0fdf4', borderRadius: 14, padding: 16,
              border: '1.5px solid #bbf7d0', marginBottom: 16,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 10,
              }}>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Total Bayar di Tempat</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                  {formatRp(total)}
                </span>
              </div>
              <div style={{
                fontSize: '0.78rem', color: '#6b7280',
                borderTop: '1px dashed #d1d5db', paddingTop: 10,
              }}>
                <div style={{ marginBottom: 4 }}>
                  📍 <strong>Alamat:</strong> {address || '-'}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: '#fffbeb', borderRadius: 12, padding: '12px 14px',
              border: '1px solid #fde68a', marginBottom: 20,
              fontSize: '0.76rem', color: '#92400e',
            }}>
              <strong>💡 Tips:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: 1.7 }}>
                <li>Siapkan uang pas untuk mempercepat transaksi</li>
                <li>Pastikan alamat pengiriman sudah benar</li>
                <li>Hubungi kami jika ada kendala</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} style={btnSecondary}>Batal</button>
              <button onClick={handleConfirmCOD} style={{
                ...btnPrimary,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              }}>
                ✅ Konfirmasi Pesanan
              </button>
            </div>
          </>
        )}

        {step === 1 && <ProcessingScreen message="Mengirim pesanan ke restoran..." />}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAYMENT GATEWAY MODAL
   ═══════════════════════════════════════════════════════════════ */
export default function PaymentGateway({ paymentMethod, total, address, onComplete, onCancel }) {
  const headerTitle = {
    'Transfer Bank': '🏦 Transfer Bank',
    'E-Wallet': '💳 E-Wallet',
    'COD': '🚚 Bayar di Tempat (COD)',
  }

  const headerSubtitle = {
    'Transfer Bank': 'Transfer ke Virtual Account bank pilihan Anda',
    'E-Wallet': 'Bayar cepat dengan dompet digital favorit Anda',
    'COD': 'Bayar tunai saat pesanan sampai di tujuan',
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerGradient}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {headerTitle[paymentMethod] || '💳 Pembayaran'}
          </h2>
          <p style={{ opacity: 0.85, marginTop: 4, fontSize: '0.82rem', margin: '4px 0 0' }}>
            {headerSubtitle[paymentMethod] || 'Pilih metode pembayaran'}
          </p>
        </div>

        {/* Flow content based on payment method */}
        {paymentMethod === 'Transfer Bank' && (
          <TransferBankFlow total={total} onComplete={onComplete} onCancel={onCancel} />
        )}
        {paymentMethod === 'E-Wallet' && (
          <EWalletFlow total={total} onComplete={onComplete} onCancel={onCancel} />
        )}
        {paymentMethod === 'COD' && (
          <CODFlow total={total} address={address} onComplete={onComplete} onCancel={onCancel} />
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pgFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pgSlideUp { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes pgSpin { 0% { transform:rotate(0deg) } 100% { transform:rotate(360deg) } }
        @keyframes pgPulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  )
}
