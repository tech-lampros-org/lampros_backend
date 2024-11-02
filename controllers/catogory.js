import Category from '../models/catogory.js';

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, subCategories } = req.body;

    const newCategory = new Category({
      name,
      description,
      image,
      subCategories, // Ensure subCategories, types, and subTypes are passed as needed
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Update category, including subcategories, types, and sub-types
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedData = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update the category itself
    Object.assign(category, updatedData);

    // Update individual subcategories if provided
    if (updatedData.subCategories) {
      updatedData.subCategories.forEach(updatedSubCategory => {
        const subCategory = category.subCategories.id(updatedSubCategory._id);
        if (subCategory) {
          Object.assign(subCategory, updatedSubCategory);
        }
      });
    }

    // Save the updated category
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};


// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

// Delete a specific subcategory from a category
export const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    subCategory.remove(); // Remove the subcategory
    await category.save();

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
};

// Get all categories, including subcategories, types, and images
export const getCategories = async (req, res) => {
  try {
    // Extract page and limit from query parameters, set default values if not provided
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch categories with pagination and populate nested subcategories and types
    const categories = await Category.find()
      .populate({
        path: 'subCategories',
        populate: {
          path: 'types',
          model: 'Type', // Replace with your actual Type model name if different
        },
      })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of categories for pagination info
    const total = await Category.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalCategories: total,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};


// Get a single category by ID, including subcategories, types, and images
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find the category by its ID and populate subcategories, including their types
    const category = await Category.findById(categoryId)
      .populate('subCategories.types') // Populate the types within subcategories
      .exec();

    // If category is not found, return a 404 status
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Send the category along with its subcategories, types, and images
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Get all subcategories of a specific category, including types and images
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    const category = await Category.findById(categoryId)
      .populate({
        path: 'subCategories',
        populate: {
          path: 'types',
        },
      })
      .exec();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const total = category.subCategories.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSubCategories = category.subCategories.slice(start, end);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalSubCategories: total,
      subCategories: paginatedSubCategories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
  }
};


// Update a specific subcategory within a category
export const updateSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const updatedData = req.body;

    // Find the category by its ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find the subcategory within the category
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Update the subcategory with the provided data
    Object.assign(subCategory, updatedData);

    // Check if types are being updated
    if (updatedData.types) {
      updatedData.types.forEach(updatedType => {
        const type = subCategory.types.id(updatedType._id);
        if (type) {
          Object.assign(type, updatedType);
        }
      });
    }

    // Save the updated category
    await category.save();

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subcategory', error });
  }
};



// Add subcategory to a category
export const addSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, image, types } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newSubCategory = { name, description, image, types }; // types can include subTypes as well
    category.subCategories.push(newSubCategory);

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subcategory', error });
  }
};

// Add type with sub-types to a subcategory
export const addTypeToSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const { name, subTypes } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    const newType = { name, subTypes }; // subTypes include name and image
    subCategory.types.push(newType);

    await category.save();
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error adding type', error });
  }
};

// Update type with sub-types
export const updateTypeInSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId, typeId } = req.params;
    const updatedData = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    const type = subCategory.types.id(typeId);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    Object.assign(type, updatedData); // Update type and sub-types
    await category.save();

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating type', error });
  }
};

// Delete type from subcategory
export const deleteTypeFromSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId, typeId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    const type = subCategory.types.id(typeId);
    if (!type) {
      return res.status(404).json({ message: 'Type not found' });
    }

    type.remove();
    await category.save();

    res.json({ message: 'Type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting type', error });
  }
};
