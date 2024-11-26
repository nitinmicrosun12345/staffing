/**
 * Formats a date to IST timezone and removes the time part.
 * @param {String|Date} inputDate - The initial date (as a string or Date object).
 * @returns {String} - The formatted date as "YYYY-MM-DD" in IST.
 */
export default function formatDateToIST(inputDate) {
  try {
    // Convert inputDate to a Date object
    const utcDate = new Date(inputDate);

    if (isNaN(utcDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Convert UTC to IST (UTC + 5:30)
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(utcDate.getTime() + offset);

    // Extract the date part in YYYY-MM-DD format
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(istDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error.message);
    return null;
  }
}


