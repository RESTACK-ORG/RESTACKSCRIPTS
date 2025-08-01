export function convertDateToUnix(dateString) {
  const dateParts = dateString.split('-');
  const day = parseInt(dateParts[0], 10);
  const month = dateParts[1];
  const year = 2000 + parseInt(dateParts[2], 10); // Assuming year is in 21st century

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = monthNames.indexOf(month);

  const date = new Date(year, monthIndex, day, 0, 0, 0); // Midday

  return date.getTime() / 1000;
}


export function monthYearToUnix(dateStr) {
    const [month, year] = dateStr.split('/').map(Number);

    if (!month || !year || month < 1 || month > 12) {
        throw new Error('Invalid date format. Expected MM/YYYY');
    }

    const date = new Date(year, month - 1, 1, 0, 0, 0); // 1st of month at 00:00:00
    return Math.floor(date.getTime() / 1000); // Convert ms to seconds
}