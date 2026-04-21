import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    category: { type: String, required: true, trim: true },
    images: [{ type: String }],
    sizes: [sizeSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
