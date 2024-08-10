import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const sheets = google.sheets('v4');

// Load credentials
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

export const updateSheet = async (data) => {
  try {
    const authClient = await auth.getClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare data to be updated in the sheet
    const values = [
      [
        data.age,
        data.companyName,
        data.company_address,
        data.company_city,
        data.company_email,
        data.company_gstNumber,
        data.company_phone,
        data.company_pincode,
        data.duration,
        data.email,
        data.gender,
        data.name,
        data.phone,
        data.place,
        data.plan,
        data.role,
        data.type
      ]
    ];

    // Update the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1', // Adjust range as needed
      valueInputOption: 'RAW',
      resource: {
        values
      },
      auth: authClient
    });

    return response.data;
  } catch (error) {
    console.error('Error updating Google Sheet:', error);
    throw new Error('Unable to update Google Sheet');
  }
};
