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
    const products = await Product.find(query).populate('createdBy', '-password');

    // Send the filtered products as a response
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};
