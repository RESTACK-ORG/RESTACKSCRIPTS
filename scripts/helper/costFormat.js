export const convertToCrore = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 0;
  return +(amount / 1e7).toFixed(2);
};