import ProProduct from '../models/pro-products.js';

// Controller to handle adding a new product
export const addProduct = async (req, res) => {
  try {
    const {
      seller, name, category, subCategory, type, price, quantity, about, technicalDetails,
      manufactureDetails, warrantyAndCertifications, images,subType
    } = req.body;

    // Validate required fields
    if (!name || !price || !quantity) {
      return res.status(400).json({ message: 'Name, price, and quantity are required.' });
    }

    // Create a new product with the data and the logged-in user as the creator
    const product = new ProProduct({
      seller,
      name,
      category,
      subCategory,
      type,
      subType,
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

// Controller to list all products with optional pagination
export const listAllProducts = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch all products with pagination
    const products = await ProProduct.find()
      .skip(skip)
      .limit(limit)
      .populate('createdBy', '-password'); // Optionally populate user info

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
    const products = await ProProduct.find({ createdBy: req.user._id });

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
      subType,
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

    if (subType) {
      query.subType = { $in: subType.split(',') };
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
    const products = await ProProduct.find(query).populate('createdBy', '-password');

    // Send the filtered products as a response
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};



export const searchProducts = async (req, res) => {
  try {
    // Extract query parameters from the request
    const {
      query, // General search query
      sellerName,
      sellerPhoneNumber,
      category,
      subCategory,
      type,
      subType,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      brand,
      color,
      material,
      warranty,
      isoCertified
    } = req.query;

    // Initialize the query object
    let queryObject = {};

    // General search query with partial matching (fuzzy search)
    if (query) {
      const regex = new RegExp(query.split('').join('.*'), 'i'); // Fuzzy matching regex
      queryObject = {
        $or: [
          { 'seller.name': regex },
          { 'seller.phoneNumber': regex },
          { category: regex },
          { subCategory: regex },
          { type: regex },
          { subType: regex },
          { 'technicalDetails.brand': regex },
          { 'technicalDetails.color': regex },
          { 'technicalDetails.material': regex }
        ]
      };
    }

    // Add additional filters to the query object
    if (sellerName) {
      queryObject['seller.name'] = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      queryObject['seller.phoneNumber'] = { $in: sellerPhoneNumber.split(',') };
    }

    if (category) {
      queryObject.category = { $in: category.split(',') };
    }

    if (subCategory) {
      queryObject.subCategory = { $in: subCategory.split(',') };
    }

    if (type) {
      queryObject.type = { $in: type.split(',') };
    }

    if (subType) {
      queryObject.subType = { $in: subType.split(',') };
    }

    if (minPrice || maxPrice) {
      queryObject.price = {};
      if (minPrice) queryObject.price.$gte = Number(minPrice);
      if (maxPrice) queryObject.price.$lte = Number(maxPrice);
    }

    if (minQuantity || maxQuantity) {
      queryObject.quantity = {};
      if (minQuantity) queryObject.quantity.$gte = Number(minQuantity);
      if (maxQuantity) queryObject.quantity.$lte = Number(maxQuantity);
    }

    if (brand) {
      queryObject['technicalDetails.brand'] = { $in: brand.split(',') };
    }

    if (color) {
      queryObject['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (material) {
      queryObject['technicalDetails.material'] = { $in: material.split(',') };
    }

    if (warranty) {
      queryObject['warrantyAndCertifications.warranty'] = warranty === 'true';
    }

    if (isoCertified) {
      queryObject['warrantyAndCertifications.isoCertified'] = isoCertified === 'true';
    }

    // Fetch products based on the dynamic query
    const products = await ProProduct.find(queryObject).populate('createdBy', '-password');

    // Categorize results
    const categorizedResults = {
      general: products,
      sellerNameMatches: products.filter(p => sellerName && p.seller.name && sellerName.split(',').includes(p.seller.name)),
      sellerPhoneNumberMatches: products.filter(p => sellerPhoneNumber && p.seller.phoneNumber && sellerPhoneNumber.split(',').includes(p.seller.phoneNumber)),
      categoryMatches: products.filter(p => category && p.category && category.split(',').includes(p.category)),
      subCategoryMatches: products.filter(p => subCategory && p.subCategory && subCategory.split(',').includes(p.subCategory)),
      typeMatches: products.filter(p => type && p.type && type.split(',').includes(p.type)),
      subTypeMatches: products.filter(p => subType && p.subType && subType.split(',').includes(p.subType)),
      brandMatches: products.filter(p => brand && p.technicalDetails.brand && brand.split(',').includes(p.technicalDetails.brand)),
      colorMatches: products.filter(p => color && p.technicalDetails.color && color.split(',').includes(p.technicalDetails.color)),
      materialMatches: products.filter(p => material && p.technicalDetails.material && material.split(',').includes(p.technicalDetails.material)),
      priceRangeMatches: products.filter(p => {
        const priceCheck = (minPrice || maxPrice) ? (p.price >= (minPrice || 0) && p.price <= (maxPrice || Infinity)) : true;
        return priceCheck;
      }),
      quantityRangeMatches: products.filter(p => {
        const quantityCheck = (minQuantity || maxQuantity) ? (p.quantity >= (minQuantity || 0) && p.quantity <= (maxQuantity || Infinity)) : true;
        return quantityCheck;
      }),
      warrantyMatches: products.filter(p => warranty !== undefined && p.warrantyAndCertifications.warranty === (warranty === 'true')),
      isoCertifiedMatches: products.filter(p => isoCertified !== undefined && p.warrantyAndCertifications.isoCertified === (isoCertified === 'true'))
    };

    // Send the categorized response
    res.status(200).json(categorizedResults);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search products', error: error.message });
  }
};

