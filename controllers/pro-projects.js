import ProProject from '../models/pro-projects.js';

// Controller to handle adding a new project
export const addProject = async (req, res) => {
  try {
    const {
      sellerName, sellerPhoneNumber, projectType, projectLocation, constructionType, houseType,
      style, layout, numberOfBathrooms, areaSquareFeet, plotSize, scope, cost, about, images,
      floors, numberOfParkings, propertyOwnership, transactionTypeForProperty, plotSizeForProperty,
      boundaryWall, cornerProperty, propertyAge,tags , title
    } = req.body;

    // Create a new project with the data and the logged-in user as the creator
    const project = new ProProject({
      sellerName,
      sellerPhoneNumber,
      projectType,
      projectLocation,
      constructionType,
      houseType,
      style,
      title,
      layout,
      numberOfBathrooms,
      areaSquareFeet,
      plotSize,
      scope,
      cost,
      about,
      images,
      floors,
      numberOfParkings,
      propertyOwnership,
      transactionTypeForProperty,
      plotSizeForProperty,
      boundaryWall,
      cornerProperty,
      propertyAge,
      tags,
      createdBy: req.user, // Assumes req.user contains the authenticated user's data
    });

    // Save the project to the database
    await project.save();

    // Send a success response
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// Controller to list all projects
export const listAllProjects = async (req, res) => {
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

    // Fetch projects with pagination, sorting, and populate fields
    const projectsPromise = ProProject.find()
      .populate('createdBy', '-password') // Populate 'createdBy' and exclude 'password'
      .sort({ [sortBy]: sortOrder }) // Sort based on query parameters
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of projects
    const countPromise = ProProject.countDocuments().exec();

    // Execute both queries in parallel
    const [projects, total] = await Promise.all([projectsPromise, countPromise]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Handle case where requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProjects: total,
        projects: [],
      });
    }

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProjects: total,
      projects,
    });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};


// Controller to list projects created by the authenticated user
export const listUserProjects = async (req, res) => {
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

    // Fetch projects created by the authenticated user with pagination and populate fields
    const projectsPromise = ProProject.find({ createdBy: req.user._id })
      .populate('createdBy', '-password') // Populate 'createdBy' and exclude 'password'
      .sort({ [sortBy]: sortOrder }) // Sort based on query parameters
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of user's projects
    const countPromise = ProProject.countDocuments({ createdBy: req.user._id }).exec();

    // Execute both queries in parallel
    const [projects, total] = await Promise.all([projectsPromise, countPromise]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Handle case where requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProjects: total,
        projects: [],
      });
    }

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProjects: total,
      projects,
    });
  } catch (error) {
    console.error('Error retrieving user projects:', error);
    res.status(500).json({ message: 'Failed to retrieve user projects', error: error.message });
  }
};


export const filterProjects = async (req, res) => {
  try {
    // Initialize the query object
    let queryObject = {};

    // Extract pagination and sorting parameters from query, set default values
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

    // Extract other query parameters from the request
    const {
      query, // General search query
      sellerName,
      sellerPhoneNumber,
      projectType,
      projectLocation,
      constructionType,
      houseType,
      style,
      title,
      numberOfBathrooms,
      minArea,
      maxArea,
      minCost,
      maxCost,
      propertyOwnership,
      transactionTypeForProperty,
      plotSizeForProperty,
      boundaryWall,
      cornerProperty,
      propertyAge,
      tags,
      brand,
      sortBy: sortByParam,
      order: orderParam,
    } = req.query;

    // General search query with partial matching (fuzzy search)
    if (query) {
      const regex = new RegExp(query.split('').join('.*'), 'i'); // Fuzzy matching regex
      queryObject.$or = [
        { sellerName: regex },
        { sellerPhoneNumber: regex },
        { projectType: regex },
        { projectLocation: regex },
        { constructionType: regex },
        { houseType: regex },
        { style: regex },
        { title: regex },
        { numberOfBathrooms: regex },
        { 'technicalDetails.brand': regex },
        { 'technicalDetails.color': regex },
        { 'technicalDetails.material': regex },
      ];
    }

    // Add additional filters to the query object
    if (sellerName) {
      queryObject.sellerName = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      queryObject.sellerPhoneNumber = { $in: sellerPhoneNumber.split(',') };
    }

    if (projectType) {
      queryObject.projectType = { $in: projectType.split(',') };
    }

    if (projectLocation) {
      queryObject['projectLocation.place'] = { $in: projectLocation.split(',') };
    }

    if (constructionType) {
      queryObject.constructionType = { $in: constructionType.split(',') };
    }

    if (title) {
      queryObject.title = { $in: title.split(',') };
    }

    if (houseType) {
      queryObject.houseType = { $in: houseType.split(',') };
    }

    if (style) {
      queryObject.style = { $in: style.split(',') };
    }

    if (numberOfBathrooms) {
      queryObject.numberOfBathrooms = { $in: numberOfBathrooms.split(',') };
    }

    if (minArea || maxArea) {
      queryObject.areaSquareFeet = {};
      if (minArea) queryObject.areaSquareFeet.$gte = Number(minArea);
      if (maxArea) queryObject.areaSquareFeet.$lte = Number(maxArea);
    }

    if (minCost || maxCost) {
      queryObject.cost = {};
      if (minCost) queryObject.cost.$gte = Number(minCost);
      if (maxCost) queryObject.cost.$lte = Number(maxCost);
    }

    if (propertyOwnership) {
      queryObject.propertyOwnership = { $in: propertyOwnership.split(',') };
    }

    if (transactionTypeForProperty) {
      queryObject.transactionTypeForProperty = { $in: transactionTypeForProperty.split(',') };
    }

    if (plotSizeForProperty) {
      queryObject.plotSizeForProperty = { $in: plotSizeForProperty.split(',') };
    }

    if (boundaryWall) {
      queryObject.boundaryWall = boundaryWall === 'true';
    }

    if (cornerProperty) {
      queryObject.cornerProperty = cornerProperty === 'true';
    }

    if (propertyAge) {
      queryObject.propertyAge = { $in: propertyAge.split(',') };
    }

    if (tags) {
      queryObject.tags = { $in: tags.split(',') };
    }

    if (brand) {
      queryObject['technicalDetails.brand'] = { $in: brand.split(',') };
    }

    if (color) {
      queryObject['technicalDetails.color'] = { $in: color.split(',') };
    }

    if (material) {
      queryObject['technicalDetails.material'] = { $in: material.split(',') };
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

    // Fetch projects with pagination, sorting, and populate fields
    const projectsPromise = ProProject.find(queryObject)
      .populate('createdBy', '-password')
      .populate('brand')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of projects matching the query
    const countPromise = ProProject.countDocuments(queryObject).exec();

    // Execute both queries in parallel
    const [projects, total] = await Promise.all([projectsPromise, countPromise]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Handle case where requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProjects: total,
        projects: [],
      });
    }

    // If brand filter is provided, filter projects based on brand name
    if (brand) {
      const brandNames = brand.split(',');
      const filteredProjects = projects.filter(project =>
        project.brand && brandNames.includes(project.brand.name)
      );
      return res.status(200).json({
        currentPage: page,
        totalPages,
        totalProjects: filteredProjects.length,
        projects: filteredProjects,
      });
    }

    // Send the paginated and filtered projects as a response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProjects: total,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};


// Update with your actual model path

export const generalSearchProjects = async (req, res) => {
  try {
    // Initialize the query object
    let queryObject = {};

    // Extract pagination and sorting parameters from query, set default values
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', query } = req.query;

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

    // Extract other query parameters from the request
    const {
      sellerName,
      sellerPhoneNumber,
      projectType,
      projectLocation,
      constructionType,
      houseType,
      style,
      numberOfBathrooms,
      title,
      minArea,
      maxArea,
      minCost,
      maxCost,
      propertyOwnership,
      transactionTypeForProperty,
      plotSizeForProperty,
      boundaryWall,
      cornerProperty,
      propertyAge,
      tags,
    } = req.query;

    // General search query with fuzzy matching (partial matches)
    if (query) {
      const regex = new RegExp(query.split('').join('.*'), 'i'); // Fuzzy matching regex
      queryObject.$or = [
        { sellerName: regex },
        { sellerPhoneNumber: regex },
        { projectType: regex },
        { projectLocation: regex },
        { constructionType: regex },
        { houseType: regex },
        { style: regex },
        { propertyOwnership: regex },
        { title: regex },
        { transactionTypeForProperty: regex },
        { plotSizeForProperty: regex },
        { propertyAge: regex },
      ];
    }

    // Add additional filters to the query object
    if (sellerName) {
      queryObject.sellerName = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      queryObject.sellerPhoneNumber = { $in: sellerPhoneNumber.split(',') };
    }

    if (projectType) {
      queryObject.projectType = { $in: projectType.split(',') };
    }

    if (projectLocation) {
      queryObject.projectLocation = { $in: projectLocation.split(',') };
    }

    if (constructionType) {
      queryObject.constructionType = { $in: constructionType.split(',') };
    }

    if (houseType) {
      queryObject.houseType = { $in: houseType.split(',') };
    }

    if (style) {
      queryObject.style = { $in: style.split(',') };
    }

    if (numberOfBathrooms) {
      queryObject.numberOfBathrooms = { $in: numberOfBathrooms.split(',').map(Number) }; // Ensure numeric comparison
    }

    if (title) {
      queryObject.title = { $in: title.split(',') };
    }

    if (minArea || maxArea) {
      queryObject.areaSquareFeet = {};
      if (minArea) queryObject.areaSquareFeet.$gte = Number(minArea);
      if (maxArea) queryObject.areaSquareFeet.$lte = Number(maxArea);
    }

    if (minCost || maxCost) {
      queryObject.cost = {};
      if (minCost) queryObject.cost.$gte = Number(minCost);
      if (maxCost) queryObject.cost.$lte = Number(maxCost);
    }

    if (propertyOwnership) {
      queryObject.propertyOwnership = { $in: propertyOwnership.split(',') };
    }

    if (transactionTypeForProperty) {
      queryObject.transactionTypeForProperty = { $in: transactionTypeForProperty.split(',') };
    }

    if (plotSizeForProperty) {
      queryObject.plotSizeForProperty = { $in: plotSizeForProperty.split(',') };
    }

    if (boundaryWall) {
      queryObject.boundaryWall = boundaryWall === 'true';
    }

    if (cornerProperty) {
      queryObject.cornerProperty = cornerProperty === 'true';
    }

    if (propertyAge) {
      queryObject.propertyAge = { $in: propertyAge.split(',').map(Number) };
    }

    if (tags) {
      queryObject.tags = { $in: tags.split(',') };
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Fetch projects with pagination, sorting, and populate fields
    const projectsPromise = ProProject.find(queryObject)
      .populate('createdBy', '-password')
      .populate('brand')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of projects matching the query
    const countPromise = ProProject.countDocuments(queryObject).exec();

    // Execute both queries in parallel
    const [projects, total] = await Promise.all([projectsPromise, countPromise]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Handle case where requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalProjects: total,
        projects: [],
      });
    }

    // Send the paginated and filtered projects as a response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalProjects: total,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search projects', error: error.message });
  }
};


