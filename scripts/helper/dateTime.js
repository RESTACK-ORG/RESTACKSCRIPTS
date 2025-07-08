export function convertDateToUnix(dateString) {
  const dateParts = dateString.split('-');
  const day = parseInt(dateParts[0], 10);
  const month = dateParts[1];
  const year = 2000 + parseInt(dateParts[2], 10); // Assuming year is in 21st century

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = monthNames.indexOf(month);

  const date = new Date(year, monthIndex, day, 12, 0, 0); // Midday

  return date.getTime() / 1000;
}
