import { expirationItems } from './ItemsList';
import { grocerySuggestions, Suggestion } from './suggestions';

export interface ExpiryItem extends Suggestion {
  expirationDate?: string;
  remainingExpiryDays?: number;
}


export const calculateRemainingExpiryDays = (expirationDate: string, name: String): number => {
  //test the styles
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    console.warn("Invalid date format. Expected 'YYYY-MM-DD'.");
    return 0;
  }

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // construct date
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const [y, m, d] = expirationDate.split('-').map(Number);
  const expiryUTC = Date.UTC(y, m - 1, d);

  // get the difference in days
  const diffDays = Math.floor((expiryUTC - todayUTC) / MS_PER_DAY);
    console.log({name, expirationDate, todayUTC, expiryUTC, diffDays });

  return Math.max(0, diffDays);
};

export const getActualExpiryItems = (): ExpiryItem[] => {
  const result = expirationItems.map(item => {
    const suggestion = grocerySuggestions.find(s =>
      s.name.toLowerCase() === item.name.toLowerCase()
    );
    if (suggestion) {
      const remainingExpiryDays = calculateRemainingExpiryDays(item.expirationDate, item.name);
      return {
        ...suggestion,
        id: item.id,
        expirationDate: item.expirationDate,
        remainingExpiryDays
      };
    }
    return {
      id: item.id,
      name: item.name,
      expiry: 'Unknown',
      expiryDays: 0,
      remainingExpiryDays: 0
    };
  });
  return result;
};


export const getExpiryColorByDays = (remainingExpiryDays: number): string => {
  if (remainingExpiryDays <= 2) return '#D32F2F'; // Dark red for 0-2 days
  if (remainingExpiryDays <= 5) return '#F44336'; // Red for 3-5 days
  if (remainingExpiryDays <= 7) return '#FF5722'; // Deep orange for 6-7 days
  if (remainingExpiryDays <= 14) return '#FF9800'; // Orange for 1-2 weeks
  if (remainingExpiryDays <= 30) return '#FFC107'; // Amber for 2-4 weeks
  if (remainingExpiryDays <= 90) return '#8BC34A'; // Light green for 1-3 months
  return '#4CAF50'; // Green for 3+ months
};

export const getExpiringSoonItems = (daysThreshold: number = 7): ExpiryItem[] => {
  return getActualExpiryItems().filter(item => 
    item.remainingExpiryDays !== undefined && item.remainingExpiryDays <= daysThreshold
  );
};