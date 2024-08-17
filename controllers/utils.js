import fetch from 'node-fetch';

export const getPincodeDetails = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({ message: 'Invalid pincode' });
    }

    const response = await fetch('https://its-me-nishmal.github.io/India-Pincode-Lookup/pincodes.json');
    const data = await response.json();

    // Filter the data array to find all entries matching the pincode
    const pincodeData = data.filter(item => item.pincode.toString() === pincode);

    if (pincodeData.length === 0) {
      return res.status(404).json({ message: 'Pincode not found' });
    }

    // Return only the first entry
    const result = pincodeData[0];

    res.status(200).json({
      taluk: result.taluk,
      districtName: result.districtName,
      stateName: result.stateName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
