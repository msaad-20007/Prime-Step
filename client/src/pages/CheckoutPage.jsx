import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useSelector, useDispatch } from 'react-redux'
import { stripePromise } from '../lib/stripe'
import { useCreatePaymentIntentMutation } from '../store/stripeApi'
import { useCreateOrderMutation } from '../store/ordersApi'
import { clearCart } from '../store/cartSlice'

const inputCls = 'w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors text-sm placeholder-gray-600'
const labelCls = 'block text-xs text-gray-400 mb-1.5 font-medium'

// ─── Order Summary ─────────────────────────────────────────────────────────────
function OrderSummary({ cartItems, cartTotal }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-gray-800">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h2>
      <ul className="space-y-3 mb-4">
        {cartItems.map((item, idx) => (
          <li key={`${item._id}-${item.size}-${idx}`} className="flex items-center gap-3">
            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
              <p className="text-gray-500 text-xs">Size {item.size} × {item.qty}</p>
            </div>
            <span className="text-accent font-semibold text-sm">${(item.price * item.qty).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-700 pt-4 flex justify-between font-bold text-text-primary">
        <span>Total</span>
        <span className="text-accent text-lg">${cartTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

// ─── Shipping Address Form ─────────────────────────────────────────────────────
function ShippingForm({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  return (
    <div className="bg-card rounded-xl p-5 border border-gray-800">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Shipping Address</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className={labelCls}>Full Name *</label>
          <input className={inputCls} value={value.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Hassan Saeed" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelCls}>Phone Number *</label>
          <input className={inputCls} value={value.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 1234567" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Street Address *</label>
          <input className={inputCls} value={value.street} onChange={e => set('street', e.target.value)} placeholder="House #12, Street 5, Block A" />
        </div>
        <div>
          <label className={labelCls}>City *</label>
          <input className={inputCls} value={value.city} onChange={e => set('city', e.target.value)} placeholder="Lahore" />
        </div>
        <div>
          <label className={labelCls}>State / Province *</label>
          <input className={inputCls} value={value.state} onChange={e => set('state', e.target.value)} placeholder="Punjab" />
        </div>
        <div>
          <label className={labelCls}>Postal Code *</label>
          <input className={inputCls} value={value.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="54000" />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input className={inputCls} value={value.country} onChange={e => set('country', e.target.value)} placeholder="Pakistan" />
        </div>
      </div>
    </div>
  )
}

// ─── Payment Method Selector ───────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'Stripe',         icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard — powered by Stripe' },
  { id: 'CashOnDelivery', icon: '💵', label: 'Cash on Delivery',    sub: 'Pay when your order arrives' },
  { id: 'Easypaisa',      icon: '📱', label: 'Easypaisa',           sub: 'Mobile wallet transfer' },
  { id: 'JazzCash',       icon: '📲', label: 'JazzCash',            sub: 'Mobile wallet transfer' },
  { id: 'BankTransfer',   icon: '🏦', label: 'Bank Transfer',       sub: 'HBL / MCB / UBL account' },
]

function PaymentMethodSelector({ selected, onSelect }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-gray-800">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h2>
      <div className="space-y-2">
        {PAYMENT_METHODS.map(m => (
          <button key={m.id} type="button" onClick={() => onSelect(m.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${selected === m.id ? 'border-accent bg-accent/10' : 'border-gray-700 hover:border-gray-500'}`}>
            <span className="text-xl w-8 text-center">{m.icon}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${selected === m.id ? 'text-accent' : 'text-text-primary'}`}>{m.label}</p>
              <p className="text-xs text-gray-500">{m.sub}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${selected === m.id ? 'border-accent bg-accent' : 'border-gray-600'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Manual Payment Info ───────────────────────────────────────────────────────
const MANUAL_INFO = {
  Easypaisa:    { title: 'Easypaisa Details',    color: 'text-green-400', bg: 'bg-green-900/20 border-green-800', fields: [{ label: 'Account Name', value: 'Prime Step' }, { label: 'Account Number', value: '0300-1234567' }] },
  JazzCash:     { title: 'JazzCash Details',     color: 'text-red-400',   bg: 'bg-red-900/20 border-red-800',     fields: [{ label: 'Account Name', value: 'Prime Step' }, { label: 'Mobile Account', value: '0311-1234567' }] },
  BankTransfer: { title: 'Bank Transfer Details', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800',   fields: [{ label: 'Bank', value: 'HBL' }, { label: 'Account Title', value: 'Prime Step' }, { label: 'Account No.', value: '1234-5678-9012-3456' }, { label: 'IBAN', value: 'PK36HABB0000001234567890' }] },
}

function ManualPaymentForm({ method, value, onChange }) {
  const info = MANUAL_INFO[method]
  if (!info) return null
  const set = (k, v) => onChange({ ...value, [k]: v })

  function handleScreenshot(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('screenshot', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border ${info.bg}`}>
        <p className={`text-sm font-bold mb-3 ${info.color}`}>{info.title}</p>
        <div className="space-y-2">
          {info.fields.map(f => (
            <div key={f.label} className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{f.label}</span>
              <span className="text-sm font-mono text-text-primary font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Send the exact amount then fill in the details below.</p>
      </div>

      <div className="bg-card rounded-xl p-5 border border-gray-800 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proof of Payment</h3>
        <div>
          <label className={labelCls}>Sender Name *</label>
          <input className={inputCls} value={value.senderName || ''} onChange={e => set('senderName', e.target.value)} placeholder="Name on your account" />
        </div>
        <div>
          <label className={labelCls}>Transaction ID / Reference *</label>
          <input className={inputCls} value={value.transactionId || ''} onChange={e => set('transactionId', e.target.value)} placeholder="e.g. TXN123456789" />
        </div>
        <div>
          <label className={labelCls}>Your Account Number (optional)</label>
          <input className={inputCls} value={value.accountNumber || ''} onChange={e => set('accountNumber', e.target.value)} placeholder="Your sending account" />
        </div>
        <div>
          <label className={labelCls}>Payment Screenshot (optional)</label>
          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-accent transition-colors overflow-hidden">
            {value.screenshot
              ? <img src={value.screenshot} alt="screenshot" className="h-full object-contain" />
              : <><span className="text-gray-500 text-sm">Click to upload</span><span className="text-gray-600 text-xs">JPG, PNG</span></>
            }
            <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── Stripe Inner Form ─────────────────────────────────────────────────────────
function StripeForm({ cartItems, cartTotal, shippingAddress }) {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [createOrder] = useCreateOrderMutation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/profile' },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message)
      setIsProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      try {
        await createOrder({
          orderItems: cartItems.map(i => ({ product: i._id, name: i.name, size: i.size, qty: i.qty, price: i.price })),
          totalPrice: cartTotal,
          shippingAddress,
          paymentMethod: 'Stripe',
          isPaid: true,
          paidAt: new Date().toISOString(),
        }).unwrap()
        dispatch(clearCart())
        navigate('/profile')
      } catch {
        setErrorMessage('Payment succeeded but order creation failed. Contact support.')
        setIsProcessing(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-card rounded-xl p-5 border border-gray-800">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Card Details</h2>
        <PaymentElement />
      </div>
      {errorMessage && <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3"><p className="text-red-400 text-sm">{errorMessage}</p></div>}
      <button type="submit" disabled={!stripe || isProcessing}
        className="w-full bg-accent text-black font-bold py-4 rounded-xl text-sm tracking-widest uppercase disabled:opacity-50 hover:opacity-90 transition-opacity">
        {isProcessing
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Processing...</span>
          : `Pay $${cartTotal.toFixed(2)}`}
      </button>
      <p className="text-center text-xs text-gray-600">🔒 Secured by Stripe. Card info never stored on our servers.</p>
    </form>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const emptyAddress = { fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Pakistan' }

export default function CheckoutPage() {
  const items = useSelector(state => state.cart.items)
  const user = useSelector(state => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const [paymentMethod, setPaymentMethod] = useState('Stripe')
  const [shippingAddress, setShippingAddress] = useState(emptyAddress)
  const [manualPayment, setManualPayment] = useState({})
  const [clientSecret, setClientSecret] = useState(null)
  const [intentError, setIntentError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [createPaymentIntent] = useCreatePaymentIntentMutation()
  const [createOrder] = useCreateOrderMutation()

  // Load Stripe payment intent once when Stripe method is selected
  useEffect(() => {
    if (paymentMethod !== 'Stripe' || clientSecret) return
    createPaymentIntent({ amount: Math.round(cartTotal * 100), currency: 'usd' })
      .unwrap()
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => setIntentError(err?.data?.message || 'Failed to initialize Stripe.'))
  }, [paymentMethod]) // eslint-disable-line

  // Admin guard — must be after all hooks
  if (user?.role === 'admin') {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4 text-text-primary">
        <div className="bg-card border border-gray-800 rounded-xl p-8 text-center max-w-sm">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-xl font-bold mb-2">Admin accounts cannot place orders</h2>
          <p className="text-gray-500 text-sm mb-6">Use a regular customer account to make purchases.</p>
          <Link to="/admin" className="bg-accent text-black font-bold px-6 py-3 rounded hover:opacity-90 text-sm">Go to Admin Panel</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Your cart is empty.</p>
        <Link to="/shop" className="bg-accent text-black font-bold px-6 py-3 rounded hover:opacity-90">Continue Shopping</Link>
      </div>
    )
  }

  // Validate address fields — pure function, no setState
  const isAddressValid = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode']
    return required.every(k => shippingAddress[k]?.trim())
  }

  const getAddressError = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode']
    for (const k of required) {
      if (!shippingAddress[k]?.trim()) return `Please fill in: ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`
    }
    return null
  }

  // Submit for non-Stripe methods
  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const addrErr = getAddressError()
    if (addrErr) { setFormError(addrErr); return }

    if (['Easypaisa', 'JazzCash', 'BankTransfer'].includes(paymentMethod)) {
      if (!manualPayment.senderName?.trim() || !manualPayment.transactionId?.trim()) {
        setFormError('Please provide your sender name and transaction ID')
        return
      }
    }

    setIsSubmitting(true)
    try {
      await createOrder({
        orderItems: items.map(i => ({ product: i._id, name: i.name, size: i.size, qty: i.qty, price: i.price })),
        totalPrice: cartTotal,
        shippingAddress,
        paymentMethod,
        manualPayment: ['Easypaisa', 'JazzCash', 'BankTransfer'].includes(paymentMethod) ? manualPayment : undefined,
        isPaid: false,
      }).unwrap()
      dispatch(clearCart())
      navigate('/profile')
    } catch (err) {
      setFormError(err?.data?.message || 'Failed to place order. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isManual = paymentMethod !== 'Stripe'

  return (
    <div className="bg-background min-h-screen text-text-primary py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/shop" className="text-gray-500 hover:text-accent transition-colors text-sm">← Shop</Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        <div className="space-y-4">
          <OrderSummary cartItems={items} cartTotal={cartTotal} />
          <ShippingForm value={shippingAddress} onChange={setShippingAddress} />
          <PaymentMethodSelector selected={paymentMethod} onSelect={m => { setPaymentMethod(m); setFormError('') }} />

          {/* COD notice */}
          {paymentMethod === 'CashOnDelivery' && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 font-semibold text-sm mb-1">💵 Cash on Delivery</p>
              <p className="text-gray-400 text-sm">You'll pay in cash when your order arrives. Please have the exact amount ready.</p>
            </div>
          )}

          {/* Manual payment forms */}
          {['Easypaisa', 'JazzCash', 'BankTransfer'].includes(paymentMethod) && (
            <ManualPaymentForm method={paymentMethod} value={manualPayment} onChange={setManualPayment} />
          )}

          {/* Stripe section */}
          {paymentMethod === 'Stripe' && (
            intentError
              ? <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4"><p className="text-red-400 text-sm">{intentError}</p></div>
              : !clientSecret
              ? <div className="flex items-center justify-center py-8 gap-3"><div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin" /><p className="text-gray-400 text-sm">Loading payment form...</p></div>
              : <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D4FF14', colorBackground: '#121212' } } }}>
                  <StripeForm cartItems={items} cartTotal={cartTotal} shippingAddress={shippingAddress} />
                </Elements>
          )}

          {/* Error message */}
          {formError && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          {/* Submit for non-Stripe */}
          {isManual && (
            <form onSubmit={handleManualSubmit}>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-accent text-black font-bold py-4 rounded-xl text-sm tracking-widest uppercase disabled:opacity-50 hover:opacity-90 transition-opacity">
                {isSubmitting
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Placing Order...</span>
                  : paymentMethod === 'CashOnDelivery'
                  ? `Place Order — Pay $${cartTotal.toFixed(2)} on Delivery`
                  : `Submit Order — $${cartTotal.toFixed(2)}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
