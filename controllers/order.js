import Order from '../models/order.js';
import User from '../models/user.js';
import Product from '../models/pro-products.js';

// Middleware to ensure user is authenticated
// Assume `protect` middleware sets `req.user` to the logged-in user's ID
// Example: req.user = logged-in user's ObjectId;

// Create an order
export const createOrder = async (req, res) => {
  try {
    const { productId, deliveryAddressId, quantity } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    // Validate the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the user's delivery address
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deliveryAddress = user.deliveryAddresses.id(deliveryAddressId);
    if (!deliveryAddress) {
      return res.status(404).json({ message: 'Delivery address not found' });
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create the new order
    const newOrder = new Order({
      user: req.user,
      deliveryAddress: deliveryAddressId,
      product: {
        productId,
        price: product.price,
        quantity,
      },
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all orders with populated product and brand details
export const getOrders = async (req, res) => {
  try {
    // Validate and parse query parameters
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    // Default values for page and limit
    page = isNaN(page) || page < 1 ? 1 : page; // Default page is 1
    limit = isNaN(limit) || limit <= 0 ? 10 : limit; // Default limit is 10

    // Calculate skip value
    const skip = (page - 1) * limit;

    const { orderStatus, user, createdBy } = req.query;

    // Build the query object
    const query = {};
    if (orderStatus) {
      query.orderStatus = orderStatus; // Filter by orderStatus if provided
    }
    if (user === 'true') {
      query.user = req.user; // Filter by user if user=true
    }
    if (createdBy === 'true') {
      query['product.createdBy'] = req.user; // Filter by products created by the seller
    }

    // Get total count for the current query
    const totalOrderCount = await Order.countDocuments(query);

    // Fetch paginated orders based on the query
    const orders = await Order.find(query)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'product.productId',
        populate: {
          path: 'brand', // Populate both brand and createdBy fields
        },
      });

    // Aggregate counts for each orderStatus within the current query
    const orderStatusCounts = await Order.aggregate([
      { $match: query }, // Match orders based on the query
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]).then((results) =>
      results.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {})
    );

    // Manually populate the delivery address
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.user);
        const deliveryAddress = user?.deliveryAddresses.id(order.deliveryAddress);
        return {
          ...order._doc,
          deliveryAddress,
        };
      })
    );

    // Calculate pagination details
    const totalPages = Math.ceil(totalOrderCount / limit);

    // Prepare the response
    res.status(200).json({
      success: true,
      counts: {
        total: totalOrderCount, // Total orders matching the query
        byStatus: orderStatusCounts, // Counts by orderStatus within the query
      },
      pagination: {
        page,
        limit,
        currentPage: page,
        totalPages,
      },
      data: populatedOrders, // Paginated list of orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};








// Get a single order by ID with populated details
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: 'product.productId',
        populate: {
          path: 'brandId', // Populate brandId inside Product
        },
      })
      .populate('deliveryAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update order details (quantity or status)
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity, orderStatus } = req.body;

    const order = await Order.findById(orderId).populate('product.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (quantity) {
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than zero' });
      }
      order.product.quantity = quantity;
      order.totalAmount = order.product.productId.price * quantity;
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
