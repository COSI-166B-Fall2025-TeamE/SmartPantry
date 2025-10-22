import { expirationItems } from './ItemsList';
import { grocerySuggestions, Suggestion } from './suggestions';

export interface ExpiryItem extends Suggestion {
  purchaseDate?: string;
  remainingExpiryDays?: number;
}

export const calculateRemainingExpiryDays = (purchaseDate: Date, originalExpiryDays: number): number => {
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - purchaseDate.getTime();
  const daysSincePurchase = timeDiff / (1000 * 3600 * 24);
  const remainingExpiryDays = originalExpiryDays - daysSincePurchase;
  
  return Math.max(0, remainingExpiryDays);
};

export const getActualExpiryItems = (): ExpiryItem[] => {
  return expirationItems.map(item => {
    const suggestion = grocerySuggestions.find(s => 
      s.name.toLowerCase() === item.name.toLowerCase()
    );
    if (suggestion) {
      const purchaseDate = new Date(item.expirationDate);
      const remainingExpiryDays = calculateRemainingExpiryDays(purchaseDate, suggestion.expiryDays);
      
      return {
        ...suggestion,
        purchaseDate: item.expirationDate,
        remainingExpiryDays: remainingExpiryDays
      };
    }
    return {
      name: item.expirationDate,
      expiry: 'Unknown',
      expiryDays: 0,
      remainingExpiryDays: 0
    };
  });
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