import ProProduct from '../models/pro-products.js';

// Controller to handle adding a new product
export const addProduct = async (req, res) => {
  try {
    const {
      seller, name, category, subCategory, type, price, quantity, about, technicalDetails,
      manufactureDetails, warrantyAndCertifications, images
    } = req.body;

    // Create a new product with the data and the logged-in user as the creator
    const product = new ProProduct({
      seller,
      name,
      category,
      subCategory,
      type,
      price,
      quantity,
      about,
      technicalDetails,
      manufactureDetails,
      warrantyAndCertifications,
      images,
      createdBy: req.user, // Assumes req.user contains the authenticated user's data
    });

    // Save the product to the database
    await product.save();

    // Send a success response
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Controller to list all products
export const listAllProducts = async (req, res) => {
  try {
    // Fetch all products
    const products = await ProProduct.find().populate('createdBy', '-password'); // Optionally populate user info

    // Send the products as a response
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};

// Controller to list products created by the authenticated user
export const listUserProducts = async (req, res) => {
  try {
    // Fetch products created by the authenticated user
    const products = await ProProduct.find({ createdBy: req.user });

    // Send the products as a response
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user products', error: error.message });
  }
};

// Controller to filter products based on query parameters
export const filterProducts = async (req, res) => {
  try {
    // Initialize a query object
    let query = {};

    // Extract query parameters from the request
    const {
      sellerName,
      sellerPhoneNumber,
      category,
      subCategory,
      type,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      brand,
      color,
      material,
      warranty,
      isoCertified,
    } = req.query;

    // Add filters to the query object based on the request parameters
    if (sellerName) {
      query['seller.name'] = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      query['seller.phoneNumber'] = { $in: sellerPhoneNumber.split(',') };
    }

    if (category) {
      query.category = { $in: category.split(',') };
    }

    if (subCategory) {
      query.subCategory = { $in: subCategory.split(',') };
    }

    if (type) {
      query.type = { $in: type.split(',') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minQuantity || maxQuantity) {
      query.quantity = {};
      if (minQuantity) query.quantity.$gte = Number(minQuantity);
      if (maxQuantity) query.quantity.$lte = Number(maxQuantity);
    }

    if (brand) {
      query['technicalDetails.brand'] = { $in: brand.split(',') };
    }

    if (color) {
      query['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (material) {
      query['technicalDetails.material'] = { $in: material.split(',') };
    }

    if (warranty) {
      query['warrantyAndCertifications.warranty'] = warranty === 'true';
    }

    if (isoCertified) {
      query['warrantyAndCertifications.isoCertified'] = isoCertified === 'true';
    }

    // Fetch products based on the dynamic query
    const products = await ProProduct.find(query);

    // Send the filtered products as a response
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};
