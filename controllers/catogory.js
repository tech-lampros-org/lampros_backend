import Category from '../models/catogory.js';

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, subCategories } = req.body;
    const newCategory = new Category({
      name,
      description,
      image,
      subCategories,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedData = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updatedData, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(updatedCategory);
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

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Add subcategory to a category
export const addSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newSubCategory = { name, description, image };
    category.subCategories.push(newSubCategory);

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subcategory', error });
  }
};

// Update subcategory
export const updateSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const updatedData = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    Object.assign(subCategory, updatedData);
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subcategory', error });
  }
};

// Delete subcategory
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

    subCategory.remove();
    await category.save();

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
};

// Get all subcategories of a category
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).select('subCategories');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category.subCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategories', error });
  }
};
