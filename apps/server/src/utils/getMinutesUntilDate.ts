function getMinutesUntilDate(date: Date) {
  const now = Date.now();

  return Math.ceil((date.getTime() - now) / (1000 * 60));
}

export default getMinutesUntilDate;
