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
      planToBuyInMonths
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

export { createEnquiry };
