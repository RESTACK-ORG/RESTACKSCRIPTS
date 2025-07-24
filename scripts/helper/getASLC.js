export const calculateASLC = (lastModifiedTimestamp) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const diffInSeconds = currentTimestamp - lastModifiedTimestamp;
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24));
  return diffInDays;
};
