import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:    { type: String, required: true },
    size:    { type: String, required: true },
    qty:     { type: Number, required: true, min: 1 },
    price:   { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true },
    phone:      { type: String, required: true },
    street:     { type: String, required: true },
    city:       { type: String, required: true },
    state:      { type: String, required: true },
    postalCode: { type: String, required: true },
    country:    { type: String, default: 'Pakistan' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems:      [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod:   {
      type: String,
      enum: ['Stripe', 'CashOnDelivery', 'Easypaisa', 'JazzCash', 'BankTransfer'],
      required: true,
    },
    // For manual payments (Easypaisa / JazzCash / Bank)
    manualPayment: {
      senderName:      { type: String },
      transactionId:   { type: String },
      accountNumber:   { type: String },
      screenshot:      { type: String }, // base64 or URL
    },
    totalPrice:      { type: Number, required: true, min: 0 },
    isPaid:          { type: Boolean, default: false },
    paidAt:          { type: Date },
    trackingStatus:  {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
