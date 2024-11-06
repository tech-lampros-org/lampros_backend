import Order from '../models/order.js';
import User from '../models/user.js';
import { protect } from '../middlewares/protect.js'; // Protect middleware to secure the route

// Create an order
export const createOrder = async (req, res) => {
  try {
    const { product, deliveryAddressId } = req.body; // Get product and delivery address ID from request body

    // Find the user's delivery address
    const user = await User.findById(req.user); // Get the logged-in user
    const deliveryAddress = user.deliveryAddresses.id(deliveryAddressId); // Retrieve the specific delivery address by ID

    if (!deliveryAddress) {
      return res.status(404).json({ message: 'Delivery address not found' });
    }

    // Create the new order
    const newOrder = new Order({
      user: req.user,  // User who created the order
      deliveryAddress: deliveryAddressId,  // Address for delivery
      product,  // Product details
    });

    await newOrder.save();

    res.status(201).json(newOrder); // Respond with the created order
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order quantity
export const updateOrderQuantity = async (req, res) => {
  try {
    const { orderId, newQuantity } = req.body; // Get order ID and new quantity from request body

    // Find the order and update the quantity
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.updateQuantity(newQuantity);

    res.status(200).json(order); // Respond with the updated order
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
