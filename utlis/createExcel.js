const XLSX = require('xlsx');

/**
 * Service to create an Excel file in memory and send as a downloadable link
 * @param {Array} data - Array of objects to convert to Excel
 * @param {string} fileName - Desired file name for the download
 * @returns {Buffer} - Buffer of the Excel file
 */
const createExcelBuffer = (data, fileName = 'output.xlsx') => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data: Must be a non-empty array of objects');
    }

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return { buffer, fileName };
  } catch (error) {
    console.error('Error creating Excel buffer:', error.message);
    throw error;
  }
};

module.exports = createExcelBuffer;
