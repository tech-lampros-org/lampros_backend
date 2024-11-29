// controllers/deliveryAddress.js
import User from '../models/user.js';

// Add a new delivery address
export const addDeliveryAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      altMobile,
      pincode,
      district,
      city,
      address,
      landmark,
    } = req.body;

    

    // Find the user by ID
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create a new delivery address
    const newDeliveryAddress = {
      fullName,
      mobile,
      altMobile,
      pincode,
      district,
      city,
      address,
      landmark,
    };

    // Add the delivery address to the user's deliveryAddresses array
    user.deliveryAddresses.push(newDeliveryAddress);

    // Save the updated user
    await user.save();

    // Get the newly added address (last item in the array)
    const addedAddress = user.deliveryAddresses[user.deliveryAddresses.length - 1];

    res.status(201).json(addedAddress);
  } catch (error) {
    console.error('Error adding delivery address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all delivery addresses for the logged-in user
export const getDeliveryAddresses = async (req, res) => {
  try {
    // Find the user by ID and select only deliveryAddresses
    const user = await User.findById(req.user).select('deliveryAddresses');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user.deliveryAddresses);
  } catch (error) {
    console.error('Error fetching delivery addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific delivery address by ID
export const getDeliveryAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Find the user by ID
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the delivery address by its ID
    const deliveryAddress = user.deliveryAddresses.id(addressId);

    if (!deliveryAddress) {
      return res.status(404).json({ message: 'Delivery address not found.' });
    }

    res.status(200).json(deliveryAddress);
  } catch (error) {
    console.error('Error fetching delivery address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a delivery address by ID
export const updateDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;

    // Find the user by ID
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the delivery address by its ID
    const deliveryAddress = user.deliveryAddresses.id(addressId);

    if (!deliveryAddress) {
      return res.status(404).json({ message: 'Delivery address not found.' });
    }

    // Prevent updates to the _id field
    if (updates._id) {
      delete updates._id;
    }

    // Update the delivery address fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && updates[key] !== null) {
        deliveryAddress[key] = updates[key];
      }
    });

    // Save the updated user
    await user.save();

    res.status(200).json(deliveryAddress);
  } catch (error) {
    console.error('Error updating delivery address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a delivery address by ID
export const deleteDeliveryAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Find the user by ID
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the delivery address by its ID
    const deliveryAddress = user.deliveryAddresses.id(addressId);

    if (!deliveryAddress) {
      return res.status(404).json({ message: 'Delivery address not found.' });
    }

    // Remove the delivery address
    user.deliveryAddresses.pull(addressId);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Delivery address deleted successfully.' });
  } catch (error) {
    console.error('Error deleting delivery address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
