import ProProject from '../models/pro-projects.js';

// Controller to handle adding a new project
export const addProject = async (req, res) => {
  try {
    const {
      sellerName, sellerPhoneNumber, projectType, projectLocation, constructionType, houseType,
      style, layout, numberOfBathrooms, areaSquareFeet, plotSize, scope, cost, about, images,
      floors, numberOfParkings, propertyOwnership, transactionTypeForProperty, plotSizeForProperty,
      boundaryWall, cornerProperty, propertyAge
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
    const projects = await ProProject.find().populate('createdBy', '-password'); // Optionally populate user info

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
      propertyAge
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
      query.projectLocation = { $in: projectLocation.split(',') };
    }

    if (constructionType) {
      query.constructionType = { $in: constructionType.split(',') };
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

    // Fetch projects based on the dynamic query
    const projects = await ProProject.find(query).populate('createdBy', '-password');

    // Send the filtered projects as a response
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
  }
};