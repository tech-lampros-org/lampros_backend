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

const getAllEnquiries = async (req, res) => {
  try {
    // Get page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated enquiries
    const enquiries = await Enquiry.find()
      .populate('createdBy')
      .skip(skip)
      .limit(limit);

    // Get the total count of documents for pagination info
    const totalEnquiries = await Enquiry.countDocuments();

    res.status(200).json({
      message: 'Enquiries fetched successfully',
      currentPage: page,
      totalPages: Math.ceil(totalEnquiries / limit),
      totalEnquiries,
      enquiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { createEnquiry,getAllEnquiries };
