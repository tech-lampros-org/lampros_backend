import mongoose from 'mongoose';

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'User.deliveryAddresses', required: true }, // Reference to delivery address
  product: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, default: 'Cash on Delivery' }, // Only COD available
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.methods.updateQuantity = function (newQuantity) {
  this.product.quantity = newQuantity;
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
