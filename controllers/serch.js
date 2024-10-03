// controllers/searchController.js
import Category from '../models/catogory.js';
import Brand from '../models/brand.js';
import Product from '../models/pro-products.js';
import ProProject from '../models/pro-projects.js';
import User from '../models/user.js';

export const fuzzySearchAll = async (req, res) => {
    const { q = '' } = req.query; // Removed letterSupport parameter

    try {
        // Build the regex for fuzzy matching
        const regex = new RegExp(q, 'i'); // Case insensitive

        // Define roles to search for in the User collection
        const userRoles = ['Realtor', 'Product Seller', 'Home Owner', 'Professionals'];

        // Perform parallel searches across different collections
        const [categories, brands, products, proProjects, users] = await Promise.all([
            Category.find({ name: regex }).lean(),
            Brand.find({ name: regex }).lean(),
            Product.find({
                $or: [
                    { name: regex },
                    { about: regex }
                ]
            }).populate('brand').lean(),
            ProProject.find({
                $or: [
                    { projectType: regex },
                    { about: regex }
                ]
            }).lean(),
            User.find({
                $and: [
                    { role: { $in: userRoles } }, // Optional: Remove if not needed
                    {
                        $or: [
                            { name: regex },
                            { role: regex }
                        ]
                    }
                ]
            }).lean(),
        ]);

        // If there are users, fetch their associated projects or products
        let usersWithDetails = [];
        if (users.length > 0) {
            // Collect user IDs based on roles
            const realtorOrProfIds = users
                .filter(user => user.role === 'Realtor' || user.role === 'Professionals')
                .map(user => user._id);
            const productSellerIds = users
                .filter(user => user.role === 'Product Seller')
                .map(user => user._id);

            // Fetch all relevant projects and products in bulk
            const [projects, productsList] = await Promise.all([
                ProProject.find({ createdBy: { $in: realtorOrProfIds } }).lean(),
                Product.find({ createdBy: { $in: productSellerIds } }).lean(),
            ]);

            // Map projects and products to their respective users
            const projectsByUser = realtorOrProfIds.reduce((acc, userId) => {
                acc[userId] = [];
                return acc;
            }, {});
            projects.forEach(project => {
                if (projectsByUser[project.createdBy]) {
                    projectsByUser[project.createdBy].push(project);
                }
            });

            const productsByUser = productSellerIds.reduce((acc, userId) => {
                acc[userId] = [];
                return acc;
            }, {});
            productsList.forEach(product => {
                if (productsByUser[product.createdBy]) {
                    productsByUser[product.createdBy].push(product);
                }
            });

            // Attach projects or products to each user based on their role
            usersWithDetails = users.map(user => {
                const userWithDetails = { ...user };
                if (user.role === 'Realtor' || user.role === 'Professionals') {
                    userWithDetails.projects = projectsByUser[user._id] || [];
                } else if (user.role === 'Product Seller') {
                    userWithDetails.products = productsByUser[user._id] || [];
                }
                return userWithDetails;
            });
        }

        // Combine results
        res.status(200).json({
            success: true,
            results: {
                categories,
                brands,
                products,
                proProjects,
                users: usersWithDetails, // Use enhanced user data
            },
            totalResults: {
                categories: categories.length,
                brands: brands.length,
                products: products.length,
                proProjects: proProjects.length,
                users: usersWithDetails.length, // Updated count
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
