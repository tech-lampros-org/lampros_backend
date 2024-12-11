import ProProduct from '../models/pro-products.js';
import Brand from '../models/brand.js';
import mongoose from 'mongoose';

// Controller to handle adding a new product with brand reference
export const addProduct = async (req, res) => {
  try {
    
    const {
      seller, name, category, subCategory, type, subType, price, quantity, about, technicalDetails,
      manufactureDetails, warrantyAndCertifications, images, brandId
    } = req.body;

    // Validate required fields
    if (!name || !price || !quantity || !brandId) {
      return res.status(400).json({ message: 'Name, price, quantity, and brand are required.' });
    }

    // Check if the brand exists and is approved
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(400).json({ message: 'Brand not found or not approved by admin.' });
    }

    // Create a new product with the data and the logged-in user as the creator
    const product = new ProProduct({
      seller,
      name,
      category,
      subCategory,
      type,
      subType,
      brand: brandId,  // Reference to the brand
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
    product.brand = brand; // Set the brand reference in the product

    // Send a success response
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from the request parameters
    const {
      seller, name, category, subCategory, type, subType, price, quantity, about, technicalDetails,
      manufactureDetails, warrantyAndCertifications, images, brandId
    } = req.body;

   

   

    // Find the product by ID
    const product = await ProProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update the product with new data
    product.seller = seller || product.seller;
    product.name = name || product.name;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.type = type || product.type;
    product.subType = subType || product.subType;
    product.brand = brandId; // Reference to the updated brand
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.about = about || product.about;
    product.technicalDetails = technicalDetails || product.technicalDetails;
    product.manufactureDetails = manufactureDetails || product.manufactureDetails;
    product.warrantyAndCertifications = warrantyAndCertifications || product.warrantyAndCertifications;
    product.images = images || product.images;

    // Save the updated product to the database
    await product.save();

    // Send a success response with the updated product
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const listAllProductsByIds = async (req, res) => {
  try {
    // Extract pagination parameters from query string
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', brand, search } = req.query;

    // Extract product IDs from request body
    const { ids } = req.body;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Determine sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Initialize filter for additional query options
    const filter = {};

    // Add brand filter if provided
    if (brand) filter.brand = brand;

    // Add search filter if provided
    if (search) filter.name = { $regex: search, $options: 'i' };

    // Fetch products by individual IDs using Product.findById
    let products = [];
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const productPromises = ids.map(id => ProProduct.findById(id).populate('createdBy', '-password').populate('brand').lean());
      products = await Promise.all(productPromises);
    }

    // Apply additional filtering on the fetched products
    if (brand) {
      products = products.filter(product => product && product.brand === brand);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      products = products.filter(product => product && searchRegex.test(product.name));
    }

    // Apply sorting
    products.sort((a, b) => {
      if (sortOrder === 1) {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    // Apply pagination
    const totalProducts = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products: paginatedProducts,
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};



// Controller to list all products with optional pagination
export const listAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', brand, search } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const sortOrder = order === 'asc' ? 1 : -1;
    const filter = {};

    if (brand) filter.brand = brand;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const options = {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
      populate: [
        { path: 'createdBy', select: '-password' },
        { path: 'brand' },
      ],
      lean: true,
      leanWithId: false,
    };

    const result = await ProProduct.paginate(filter, options);

    res.status(200).json({
      currentPage: result.page,
      totalPages: result.totalPages,
      totalProducts: result.totalDocs,
      products: result.docs,
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};


export const filterProducts = async (req, res) => {
  try {
    // Initialize a query object
    let query = {};

    // Extract pagination parameters from query
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Extract other query parameters from the request
    const {
      sellerName,
      PhoneNumber,
      location,
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
      weight,
      baseWidth,
      style,
      installationType,
      finishType,
      drainType,
      seatMaterial,
      shape,
      specialFeatures,
      productModelNumber,
      asinNumber,
      productCareInstructions,
      warrantyDuration,
      isoCertified,
      warranty,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Utility function to validate non-empty and non-null values
    const isValid = (value) => value !== undefined && value !== null && value !== '';

    // Add filters to the query object based on valid request parameters
    if (isValid(sellerName)) {
      query['seller.name'] = { $in: sellerName.split(',') };
    }

    if (isValid(PhoneNumber)) {
      query['seller.phoneNumber'] = { $in: PhoneNumber };
    }

    if (isValid(location)) {
      query['seller.location'] = location;
    }

    if (isValid(category)) {
      query.category = { $in: category.split(',') };
    }

    if (isValid(subCategory)) {
      query.subCategory = { $in: subCategory.split(',') };
    }

    if (isValid(type)) {
      query.type = { $in: type.split(',') };
    }

    if (isValid(subType)) {
      query.subType = { $in: subType.split(',') };
    }

    if (isValid(minPrice) || isValid(maxPrice)) {
      query.price = {};
      if (isValid(minPrice)) query.price.$gte = Number(minPrice);
      if (isValid(maxPrice)) query.price.$lte = Number(maxPrice);
    }

    if (isValid(minQuantity) || isValid(maxQuantity)) {
      query.quantity = {};
      if (isValid(minQuantity)) query.quantity.$gte = Number(minQuantity);
      if (isValid(maxQuantity)) query.quantity.$lte = Number(maxQuantity);
    }

    if (isValid(color)) {
      query['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (isValid(material)) {
      query['technicalDetails.material'] = { $in: material.split(',') };
    }

    if (isValid(weight)) {
      query['technicalDetails.weight'] = { $in: weight.split(',').map(Number) };
    }

    if (isValid(baseWidth)) {
      query['technicalDetails.baseWidth'] = { $in: baseWidth.split(',').map(Number) };
    }

    if (isValid(style)) {
      query['technicalDetails.style'] = { $in: style.split(',') };
    }

    if (isValid(installationType)) {
      query['technicalDetails.installationType'] = { $in: installationType.split(',') };
    }

    if (isValid(finishType)) {
      query['technicalDetails.finishType'] = { $in: finishType.split(',') };
    }

    if (isValid(drainType)) {
      query['technicalDetails.drainType'] = { $in: drainType.split(',') };
    }

    if (isValid(seatMaterial)) {
      query['technicalDetails.seatMaterial'] = { $in: seatMaterial.split(',') };
    }

    if (isValid(shape)) {
      query['technicalDetails.shape'] = { $in: shape.split(',') };
    }

    if (isValid(specialFeatures)) {
      query['technicalDetails.specialFeatures'] = { $in: specialFeatures.split(',') };
    }

    if (isValid(productModelNumber)) {
      query['technicalDetails.productModelNumber'] = { $in: productModelNumber.split(',') };
    }

    if (isValid(asinNumber)) {
      query['technicalDetails.asinNumber'] = { $in: asinNumber.split(',') };
    }

    if (isValid(productCareInstructions)) {
      query['technicalDetails.productCareInstructions'] = { $in: productCareInstructions.split(',') };
    }

    if (isValid(warrantyDuration)) {
      query['warrantyAndCertifications.warrantyDuration'] = { $in: warrantyDuration.split(',').map(Number) };
    }

    if (isValid(warranty)) {
      query['warrantyAndCertifications.warranty'] = warranty === 'true';
    }

    if (isValid(isoCertified)) {
      query['warrantyAndCertifications.isoCertified'] = isoCertified === 'true';
    }

    // Sort validation and options
    const allowedSortFields = ['createdAt', 'updatedAt', 'price', 'quantity', 'name'];
    const sortByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    const sortOptions = { [sortByField]: sortOrder };

    // Fetch products and total count
    const productsPromise = ProProduct.find(query)
      .populate('createdBy', '-password')
      .populate('brand')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const countPromise = ProProduct.countDocuments(query).exec();

    const [products, total] = await Promise.all([productsPromise, countPromise]);

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProducts: total,
        products: [],
      });
    }

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProducts: total,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};






// Controller to list products created by the authenticated user
export const listUserProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    // Make sure req.user is converted to ObjectId if needed
    const userId = mongoose.Types.ObjectId(req.user);

    console.log('User ID:', userId);

    // Fetch products created by the authenticated user
    const productsPromise = ProProduct.find({ createdBy: userId })
      .populate('brand')
      .populate('createdBy', '-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const countPromise = ProProduct.countDocuments({ createdBy: userId });

    const [products, total] = await Promise.all([productsPromise, countPromise]);

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProducts: total,
        products: [],
      });
    }

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProducts: total,
      products,
    });
  } catch (error) {
    console.error('Error retrieving user products:', error);
    res.status(500).json({ message: 'Failed to retrieve user products', error: error.message });
  }
};


export const searchProducts = async (req, res) => {
  try {
    // Initialize the query object
    let queryObject = {};

    // Extract pagination parameters from query
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Extract other query parameters from the request
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
      isoCertified,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // General search query with partial matching (fuzzy search)
    if (query) {
      const regex = new RegExp(query.split('').join('.*'), 'i'); // Fuzzy matching regex
      queryObject.$or = [
        { 'seller.name': regex },
        { 'seller.phoneNumber': regex },
        { category: regex },
        { subCategory: regex },
        { type: regex },
        { subType: regex },
        { 'technicalDetails.brand': regex },
        { 'technicalDetails.color': regex },
        { 'technicalDetails.material': regex },
      ];
    }

    // Add additional filters to the query object
    if (sellerName) {
      queryObject['seller.name'] = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      queryObject['seller.phoneNumber'] = { $in: sellerPhoneNumber.split(',') };
    }

    if (location) {
      queryObject['seller.location'] = location; // Assuming exact match for location
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

    // Accept multiple values for technical details
    if (color) {
      queryObject['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (material) {
      queryObject['technicalDetails.material'] = { $in: material.split(',') };
    }

    if (weight) {
      queryObject['technicalDetails.weight'] = { $in: weight.split(',').map(Number) };
    }

    if (baseWidth) {
      queryObject['technicalDetails.baseWidth'] = { $in: baseWidth.split(',').map(Number) };
    }

    if (style) {
      queryObject['technicalDetails.style'] = { $in: style.split(',') };
    }

    if (installationType) {
      queryObject['technicalDetails.installationType'] = { $in: installationType.split(',') };
    }

    if (finishType) {
      queryObject['technicalDetails.finishType'] = { $in: finishType.split(',') };
    }

    if (drainType) {
      queryObject['technicalDetails.drainType'] = { $in: drainType.split(',') };
    }

    if (seatMaterial) {
      queryObject['technicalDetails.seatMaterial'] = { $in: seatMaterial.split(',') };
    }

    if (shape) {
      queryObject['technicalDetails.shape'] = { $in: shape.split(',') };
    }

    if (specialFeatures) {
      queryObject['technicalDetails.specialFeatures'] = { $in: specialFeatures.split(',') };
    }

    if (productModelNumber) {
      queryObject['technicalDetails.productModelNumber'] = { $in: productModelNumber.split(',') };
    }

    if (asinNumber) {
      queryObject['technicalDetails.asinNumber'] = { $in: asinNumber.split(',') };
    }

    if (productCareInstructions) {
      queryObject['technicalDetails.productCareInstructions'] = { $in: productCareInstructions.split(',') };
    }

    // Warranty and certifications filters
    if (warrantyDuration) {
      queryObject['warrantyAndCertifications.warrantyDuration'] = { $in: warrantyDuration.split(',').map(Number) };
    }

    if (warranty) {
      queryObject['warrantyAndCertifications.warranty'] = warranty === 'true';
    }

    if (isoCertified) {
      queryObject['warrantyAndCertifications.isoCertified'] = isoCertified === 'true';
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Fetch products with pagination and populate brands
    const productsPromise = ProProduct.find(queryObject)
      .populate('createdBy', '-password')
      .populate('brand') // Populate the brand to access its name
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of products matching the query
    const countPromise = ProProduct.countDocuments(queryObject).exec();

    // Execute both queries in parallel
    const [products, total] = await Promise.all([productsPromise, countPromise]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Handle case where requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProducts: total,
        products: [],
      });
    }

    // If brand filter is provided, filter products based on brand name
    if (brand) {
      const brandNames = brand.split(',');
      const filteredProducts = products.filter(product =>
        product.brand && brandNames.includes(product.brand.name)
      );
      return res.status(200).json({
        currentPage: page,
        totalPages,
        totalProducts: filteredProducts.length,
        products: filteredProducts,
      });
    }

    // Send the paginated and filtered products as a response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProducts: total,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search products', error: error.message });
  }
};


