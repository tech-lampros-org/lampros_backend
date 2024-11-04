import ProProduct from '../models/pro-products.js';
import Brand from '../models/brand.js';

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


// Controller to list all products with optional pagination
export const listAllProducts = async (req, res) => {
  try {
    // Extract pagination, sorting, filtering, and search parameters from query, set default values
    let {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      brand, // Filter by brand ID
      search, // Search term for product name
    } = req.query;

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

    // Determine sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};

    if (brand) {
      filter.brand = brand; // Assuming 'brand' is the ObjectId of the brand
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search on 'name'
    }

    // Set up pagination options
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

    // Execute the paginate query with filters
    const result = await ProProduct.paginate(filter, options);

    // Send the paginated response
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
      sellerPhoneNumber,
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

    // Add filters to the query object based on the request parameters
    if (sellerName) {
      query['seller.name'] = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      query['seller.phoneNumber'] = { $in: sellerPhoneNumber.split(',') };
    }

    if (location) {
      query['seller.location'] = location; // Assuming exact match for location
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

    // Accept multiple values for technical details
    if (color) {
      query['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (material) {
      query['technicalDetails.material'] = { $in: material.split(',') };
    }

    if (weight) {
      query['technicalDetails.weight'] = { $in: weight.split(',').map(Number) };
    }

    if (baseWidth) {
      query['technicalDetails.baseWidth'] = { $in: baseWidth.split(',').map(Number) };
    }

    if (style) {
      query['technicalDetails.style'] = { $in: style.split(',') };
    }

    if (installationType) {
      query['technicalDetails.installationType'] = { $in: installationType.split(',') };
    }

    if (finishType) {
      query['technicalDetails.finishType'] = { $in: finishType.split(',') };
    }

    if (drainType) {
      query['technicalDetails.drainType'] = { $in: drainType.split(',') };
    }

    if (seatMaterial) {
      query['technicalDetails.seatMaterial'] = { $in: seatMaterial.split(',') };
    }

    if (shape) {
      query['technicalDetails.shape'] = { $in: shape.split(',') };
    }

    if (specialFeatures) {
      query['technicalDetails.specialFeatures'] = { $in: specialFeatures.split(',') };
    }

    if (productModelNumber) {
      query['technicalDetails.productModelNumber'] = { $in: productModelNumber.split(',') };
    }

    if (asinNumber) {
      query['technicalDetails.asinNumber'] = { $in: asinNumber.split(',') };
    }

    if (productCareInstructions) {
      query['technicalDetails.productCareInstructions'] = { $in: productCareInstructions.split(',') };
    }

    // Warranty and certifications filters
    if (warrantyDuration) {
      query['warrantyAndCertifications.warrantyDuration'] = { $in: warrantyDuration.split(',').map(Number) };
    }

    if (warranty) {
      query['warrantyAndCertifications.warranty'] = warranty === 'true';
    }

    if (isoCertified) {
      query['warrantyAndCertifications.isoCertified'] = isoCertified === 'true';
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Fetch products with pagination and populate brands
    const productsPromise = ProProduct.find(query)
      .populate('createdBy', '-password')
      .populate('brand') // Populate the brand to access its name
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of products matching the query
    const countPromise = ProProduct.countDocuments(query).exec();

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
        brandNames.includes(product.brand.name) // Adjust this based on your brand schema
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
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};





// Controller to list products created by the authenticated user
export const listUserProducts = async (req, res) => {
  try {
    // Extract and parse pagination parameters from query, set default values
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

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

    // Determine sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch products created by the authenticated user with pagination and populate fields
    const productsPromise = ProProduct.find({ createdBy: req.user })
      .populate('brand') // Populate the brand
      .populate('createdBy', '-password') // Populate 'createdBy' and exclude 'password'
      .sort({ [sortBy]: sortOrder }) // Sort based on query parameters
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of user's products
    const countPromise = ProProduct.countDocuments({ createdBy: req.user }).exec();
    console.log('req.user:', req.user)
    console.log('productsPromise:', productsPromise)
    console.log('countPromise:', countPromise)

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

    // Send the paginated response
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


