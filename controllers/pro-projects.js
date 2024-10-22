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
    // Fetch all projects
    const projects = await ProProject.find().sort({ createdAt: -1 }).populate('createdBy', '-password'); // Optionally populate user info

    // Send the projects as a response
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};

// Controller to list projects created by the authenticated user
export const listUserProjects = async (req, res) => {
  try {
    // Fetch projects created by the authenticated user
    const projects = await ProProject.find({ createdBy: req.user });

    // Send the projects as a response
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user projects', error: error.message });
  }
};

export const filterProjects = async (req, res) => {
  try {
    // Initialize a query object
    let query = {};

    // Extract query parameters from the request
    const {
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
      sortBy, // New: Field to sort by
      order,  // New: Sorting order (asc or desc)
    } = req.query;

    // Add filters to the query object based on the request parameters
    if (sellerName) {
      query.sellerName = { $in: sellerName.split(',') };
    }

    if (sellerPhoneNumber) {
      query.sellerPhoneNumber = { $in: sellerPhoneNumber.split(',') };
    }

    if (projectType) {
      query.projectType = { $in: projectType.split(',') };
    }

    if (projectLocation) {
      query.projectLocation = { 
        place: { $in: projectLocation.split(',') }
      };
    }

    if (constructionType) {
      query.constructionType = { $in: constructionType.split(',') };
    }

    if (title) {
      query.title = { $in: title.split(',') };
    }

    if (houseType) {
      query.houseType = { $in: houseType.split(',') };
    }

    if (style) {
      query.style = { $in: style.split(',') };
    }

    if (numberOfBathrooms) {
      query.numberOfBathrooms = { $in: numberOfBathrooms.split(',') };
    }

    if (minArea || maxArea) {
      query.areaSquareFeet = {};
      if (minArea) query.areaSquareFeet.$gte = Number(minArea);
      if (maxArea) query.areaSquareFeet.$lte = Number(maxArea);
    }

    if (minCost || maxCost) {
      query.cost = {};
      if (minCost) query.cost.$gte = Number(minCost);
      if (maxCost) query.cost.$lte = Number(maxCost);
    }

    if (propertyOwnership) {
      query.propertyOwnership = { $in: propertyOwnership.split(',') };
    }

    if (transactionTypeForProperty) {
      query.transactionTypeForProperty = { $in: transactionTypeForProperty.split(',') };
    }

    if (plotSizeForProperty) {
      query.plotSizeForProperty = { $in: plotSizeForProperty.split(',') };
    }

    if (boundaryWall) {
      query.boundaryWall = boundaryWall === 'true';
    }

    if (cornerProperty) {
      query.cornerProperty = cornerProperty === 'true';
    }

    if (propertyAge) {
      query.propertyAge = { $in: propertyAge.split(',') };
    }
    if (tags) {
      query.tags = { $in: tags.split(',') }; // Filter projects by tag names
    }

    // Create sort options
    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1; // Use -1 for descending, 1 for ascending
      sortOptions[sortBy] = sortOrder;
    }

    // Fetch projects based on the dynamic query with sorting
    const projects = await ProProject.find(query)
      .populate('createdBy', '-password')
      .sort(sortOptions); // Apply sorting here

    // Send the filtered projects as a response
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};

// Update with your actual model path

export const generalSearchProjects = async (req, res) => {
  try {
    // Extract query parameters from the request
    const {
      query, // General search query
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

    // Initialize the query object
    let queryObject = {};

    // General search query with fuzzy matching (partial matches)
    if (query) {
      const regex = new RegExp(query.split('').join('.*'), 'i'); // Fuzzy matching regex
      queryObject = {
        $or: [
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
          { propertyAge: regex }
        ]
      };
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
      queryObject.propertyAge = { $in: propertyAge.split(',').map(Number) }; // Ensure numeric comparison
    }
    if (tags) {
      queryObject.tags = { $in: tags.split(',') }; // Filter projects by tag names
    }
    // Fetch projects based on the query object
    const projects = await ProProject.find(queryObject).populate('createdBy', '-password');

    // Categorize results
    const categorizedResults = {
      general: projects,
      sellerNameMatches: projects.filter(p => sellerName && p.sellerName && sellerName.split(',').includes(p.sellerName)),
      sellerPhoneNumberMatches: projects.filter(p => sellerPhoneNumber && p.sellerPhoneNumber && sellerPhoneNumber.split(',').includes(p.sellerPhoneNumber)),
      projectTypeMatches: projects.filter(p => projectType && p.projectType && projectType.split(',').includes(p.projectType)),
      projectLocationMatches: projects.filter(p => projectLocation && p.projectLocation && projectLocation.split(',').includes(p.projectLocation)),
      constructionTypeMatches: projects.filter(p => constructionType && p.constructionType && constructionType.split(',').includes(p.constructionType)),
      houseTypeMatches: projects.filter(p => houseType && p.houseType && houseType.split(',').includes(p.houseType)),
      styleMatches: projects.filter(p => style && p.style && style.split(',').includes(p.style)),
      numberOfBathroomsMatches: projects.filter(p => numberOfBathrooms && p.numberOfBathrooms && numberOfBathrooms.split(',').map(Number).includes(p.numberOfBathrooms)),
      rangeMatches: projects.filter(p => {
        const areaCheck = (minArea || maxArea) ? (p.areaSquareFeet >= (minArea || 0) && p.areaSquareFeet <= (maxArea || Infinity)) : true;
        const costCheck = (minCost || maxCost) ? (p.cost >= (minCost || 0) && p.cost <= (maxCost || Infinity)) : true;
        return areaCheck && costCheck;
      }),
      boundaryWallMatches: projects.filter(p => boundaryWall !== undefined && p.boundaryWall === (boundaryWall === 'true')),
      cornerPropertyMatches: projects.filter(p => cornerProperty !== undefined && p.cornerProperty === (cornerProperty === 'true')),
      propertyAgeMatches: projects.filter(p => propertyAge && p.propertyAge && propertyAge.split(',').map(Number).includes(p.propertyAge))
    };

    // Send the categorized response
    res.status(200).json(categorizedResults);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search projects', error: error.message });
  }
};

