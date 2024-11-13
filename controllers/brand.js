import Brand from '../models/brand.js';

// Controller to handle adding a new brand
export const addBrand = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Check if the brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand already exists.' });
    }

    // Create a new brand
    const brand = new Brand({
      name,
      description,
      imageUrl,
      createdBy: req.user._id,
    });

    // Save the brand to the database
    await brand.save();

    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create brand', error: error.message });
  }
};


// Controller for admin to approve a brand
export const approveBrand = async (req, res) => {
    try {
      const { brandId } = req.params;
  
      // Find the brand by ID
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
  
      // Update approval status
      brand.adminApproved = true;
      await brand.save();
  
      res.status(200).json({ message: 'Brand approved successfully', brand });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve brand', error: error.message });
    }
  };

  
  export const listAllBrands = async (req, res) => {
    try {
      // Fetch all brands without pagination
      const brands = await Brand.find();
  
      // Send the response with all brands
      res.status(200).json({
        brands,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve brands', error: error.message });
    }
  };
  
  