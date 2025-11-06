// Convert date range preset string to actual date range
export const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  switch (preset) {
    case '7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { from: start, to: endOfToday };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: endOfToday };
    }

    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: start, to: end };
    }

    case 'last_quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarterStart = currentQuarter === 0
        ? new Date(now.getFullYear() - 1, 9, 1) // Q4 of last year
        : new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);

      const lastQuarterEnd = currentQuarter === 0
        ? new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
        : new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999);

      return { from: lastQuarterStart, to: lastQuarterEnd };
    }

    case 'all_time': {
      // Go back 5 years as a reasonable "all time" limit
      const start = new Date(now.getFullYear() - 5, 0, 1);
      return { from: start, to: endOfToday };
    }

    default:
      return { from: today, to: endOfToday };
  }
};
