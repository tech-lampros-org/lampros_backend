// controllers/searchController.js
import Category from '../models/catogory.js';
import Brand from '../models/brand.js';
import Product from '../models/pro-products.js';
import ProProject from '../models/pro-projects.js';
export const fuzzySearchAll = async (req, res) => {
    const { q = '', letterSupport = 'no' } = req.query; // Removed category parameter
  
    try {
      // Build the regex for fuzzy matching
      const regex = new RegExp(q, 'i'); // Case insensitive
  
      // Prepare to filter based on letter support if necessary
      let letterQuery = {};
      if (letterSupport === 'yes') {
        letterQuery = { $or: [{ name: { $regex: regex } }, { projectType: { $regex: regex } }] }; // Adjust fields as necessary
      }
  
      // Search across different collections
      const [categories, brands, products, proProjects] = await Promise.all([
        Category.find(letterSupport === 'yes' ? letterQuery : { name: regex }).lean(),
        Brand.find(letterSupport === 'yes' ? letterQuery : { name: regex }).lean(),
        Product.find(letterSupport === 'yes' 
          ? { $or: [{ name: { $regex: regex } }, { about: { $regex: regex } }] }
          : { name: regex }
        ).lean(),
        ProProject.find(letterSupport === 'yes' 
          ? { $or: [{ projectType: { $regex: regex } }, { about: { $regex: regex } }] }
          : { projectType: regex }
        ).lean(),
      ]);
  
      // Combine results
      res.status(200).json({
        success: true,
        results: {
          categories,
          brands,
          products,
          proProjects,
        },
        totalResults: {
          categories: categories.length,
          brands: brands.length,
          products: products.length,
          proProjects: proProjects.length,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  