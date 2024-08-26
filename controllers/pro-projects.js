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
