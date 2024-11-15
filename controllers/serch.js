// controllers/searchController.js
import Category from '../models/catogory.js';
import Brand from '../models/brand.js';
import Product from '../models/pro-products.js';
import ProProject from '../models/pro-projects.js';
import User from '../models/user.js';

export const fuzzySearchAll = async (req, res) => {
    const { q = '', page = 1, limit = 10 } = req.query;

    try {
        const parsedPage = parseInt(page, 10) < 1 ? 1 : parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10) < 1 ? 10 : parseInt(limit, 10);
        const skip = (parsedPage - 1) * parsedLimit;

        // Build the regex for fuzzy matching
        const regex = new RegExp(q.split('').join('.*'), 'i'); // Fuzzy matching regex

        // Define roles to search for in the User collection
        const userRoles = ['Realtor', 'Product Seller', 'Home Owner', 'Professionals'];

        // Perform parallel searches across different collections with pagination
        const [
            categories,
            categoriesTotal,
            brands,
            brandsTotal,
            products,
            productsTotal,
            proProjects,
            proProjectsTotal,
            users,
            usersTotal
        ] = await Promise.all([
            Category.find({ name: regex }).skip(skip).limit(parsedLimit).lean(),
            Category.countDocuments({ name: regex }),
            Brand.find({ name: regex }).skip(skip).limit(parsedLimit).lean(),
            Brand.countDocuments({ name: regex }),
            Product.find({
                $or: [
                    { name: regex },
                    { about: regex }
                ]
            }).populate('brand').skip(skip).limit(parsedLimit).lean(),
            Product.countDocuments({
                $or: [
                    { name: regex },
                    { about: regex }
                ]
            }),
            ProProject.find({
                $or: [
                    { projectType: regex },
                    { about: regex }
                ]
            }).skip(skip).limit(parsedLimit).lean(),
            ProProject.countDocuments({
                $or: [
                    { projectType: regex },
                    { about: regex }
                ]
            }),
            User.find({
                $or: [
                    { fname: regex },
                    { lname: regex },
                ]
            }).skip(skip).limit(parsedLimit).lean(),
            User.countDocuments({
                $or: [
                    { fname: regex },
                    { lname: regex },
                ]
            }),
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

            // Fetch all relevant projects and products in bulk with pagination
            const [projects, projectsTotal, productsList, productsListTotal] = await Promise.all([
                ProProject.find({ createdBy: { $in: realtorOrProfIds } }).skip(skip).limit(parsedLimit).lean(),
                ProProject.countDocuments({ createdBy: { $in: realtorOrProfIds } }),
                Product.find({ createdBy: { $in: productSellerIds } }).skip(skip).limit(parsedLimit).lean(),
                Product.countDocuments({ createdBy: { $in: productSellerIds } }),
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

        // Combine results with pagination info
        res.status(200).json({
            success: true,
            results: {
                categories: {
                    data: categories,
                    currentPage: parsedPage,
                    totalPages: Math.ceil(categoriesTotal / parsedLimit),
                    totalResults: categoriesTotal
                },
                brands: {
                    data: brands,
                    currentPage: parsedPage,
                    totalPages: Math.ceil(brandsTotal / parsedLimit),
                    totalResults: brandsTotal
                },
                products: {
                    data: products,
                    currentPage: parsedPage,
                    totalPages: Math.ceil(productsTotal / parsedLimit),
                    totalResults: productsTotal
                },
                projects: {
                    data: proProjects,
                    currentPage: parsedPage,
                    totalPages: Math.ceil(proProjectsTotal / parsedLimit),
                    totalResults: proProjectsTotal
                },
                users: {
                    data: usersWithDetails,
                    currentPage: parsedPage,
                    totalPages: Math.ceil(usersTotal / parsedLimit),
                    totalResults: usersTotal
                },
            },
            totalResults: {
                categories: categoriesTotal,
                brands: brandsTotal,
                products: productsTotal,
                projects: proProjectsTotal,
                users: usersTotal,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
