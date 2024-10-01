// controllers/searchController.js
import Category from '../models/catogory.js';
import Brand from '../models/brand.js';
import Product from '../models/pro-products.js';
import ProProject from '../models/pro-projects.js';
import User from '../models/user.js';

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

        // Define roles to search for in the User collection
        const userRoles = ['Realtor', 'Product Seller', 'Home Owner', 'Professionals']; // Added 'Professionals'
        
        // Search across different collections
        const [categories, brands, products, proProjects, users] = await Promise.all([
            Category.find(letterSupport === 'yes' ? letterQuery : { name: regex }).lean(),
            Brand.find(letterSupport === 'yes' ? letterQuery : { name: regex }).lean(),
            Product.find(letterSupport === 'yes' 
                ? { $or: [{ name: { $regex: regex } }, { about: { $regex: regex } }] }
                : { name: regex }
            ).populate('brand').lean(),
            ProProject.find(letterSupport === 'yes' 
                ? { $or: [{ projectType: { $regex: regex } }, { about: { $regex: regex } }] }
                : { projectType: regex }
            ).lean(),
            User.find(letterSupport === 'yes' 
                ? { 
                    $or: [
                        { name: { $regex: regex } }, 
                        { role: { $in: userRoles } }  // Filter by role
                    ]
                }
                : { 
                    $or: [
                        { name: regex }, 
                        { role: { $in: userRoles } } // Filter by role
                    ]
                }
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
                users,
            },
            totalResults: {
                categories: categories.length,
                brands: brands.length,
                products: products.length,
                proProjects: proProjects.length,
                users: users.length,  // Include user results
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
