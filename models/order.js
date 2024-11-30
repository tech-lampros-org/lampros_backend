import mongoose from 'mongoose';

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'User.deliveryAddresses', required: true }, // Reference to delivery address
  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product schema
    price: { type: Number, required: true }, // Snapshot of product price at the time of order
    quantity: { type: Number, required: true, min: 1 }, // Quantity of product ordered
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending', // Default order status
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Online Payment'], // Allow multiple payment methods
    default: 'Cash on Delivery',
  },
  totalAmount: { type: Number, required: true }, // Total amount for the order
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the `updatedAt` field before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to update the quantity of the product in an order
orderSchema.methods.updateQuantity = function (newQuantity) {
  if (newQuantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }
  this.product.quantity = newQuantity;
  this.totalAmount = this.product.price * newQuantity; // Recalculate the total amount
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
