import Enquiry from '../models/enq.js';

const createEnquiry = async (req, res) => {
  try {
    const {
      category,
      bhkCount,
      areaSqFt,
      budgetINR,
      lookingFor,
      timelineMonths,
      pincode,
      interested,
      moreDetails,
      scopes,
      quantity,
      doorsType,
      materials,
      planToBuyInMonths,
      serviceLookingFor
    } = req.body;

    // Create a new enquiry with the data from the request
    const newEnquiry = new Enquiry({
      category,
      bhkCount,
      areaSqFt,
      budgetINR,
      lookingFor,
      timelineMonths,
      pincode,
      interested,
      moreDetails,
      scopes,
      quantity,
      doorsType,
      materials,
      planToBuyInMonths,
      serviceLookingFor,
      createdBy: req.user // Set the user ID as the creator
    });

    // Save the enquiry to the database
    await newEnquiry.save();

    res.status(201).json({
      message: 'Enquiry created successfully',
      enquiry: newEnquiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

import axios from 'axios';

const getAllEnquiries = async (req, res) => {
  try {
    // Get page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userFilter = req.query.user === 'true'; // Check if 'user=true' is passed in the query

    // Build the query filter
    let filter = {};
    if (userFilter) {
      // If user=true, filter enquiries by the authenticated user
      filter.createdBy = req.user;
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated enquiries with the filter applied
    const enquiries = await Enquiry.find(filter)
      .populate('createdBy')
      .skip(skip)
      .limit(limit);

    // Fetch pincode details dynamically for each enquiry
    const enhancedEnquiries = await Promise.all(
      enquiries.map(async (enquiry) => {
        try {
          const response = await axios.get(`https://pincode.vercel.app/${enquiry.pincode}`);
          const { taluk, districtName, stateName, officeNames } = response.data;

          return {
            ...enquiry.toObject(),
            pincodeDetails: {
              taluk,
              district: districtName,
              state: stateName,
              officeNames,
            },
          };
        } catch (error) {
          console.error(`Error fetching pincode details for ${enquiry.pincode}:`, error.message);
          return {
            ...enquiry.toObject(),
            pincodeDetails: null, // Default value if the API call fails
          };
        }
      })
    );

    // Get the total count of documents based on the filter
    const totalEnquiries = await Enquiry.countDocuments(filter);

    res.status(200).json({
      message: 'Enquiries fetched successfully',
      currentPage: page,
      totalPages: Math.ceil(totalEnquiries / limit),
      totalEnquiries,
      enquiries: enhancedEnquiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};




export { createEnquiry,getAllEnquiries };
