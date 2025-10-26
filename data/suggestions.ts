export interface Suggestion {
  name: string;
  expiry: string;
  expiryDays: number;
}

export const grocerySuggestions: Suggestion[] = [
  { name: 'Milk', expiry: '7 days', expiryDays: 7 },
  { name: 'Eggs', expiry: '3-5 weeks', expiryDays: 28 },
  { name: 'Bread', expiry: '5-7 days', expiryDays: 6 },
  { name: 'Butter', expiry: '1-3 months', expiryDays: 60 },
  { name: 'Cheese', expiry: '3-4 weeks', expiryDays: 25 },
  { name: 'Chicken', expiry: '1-2 days', expiryDays: 1.5 },
  { name: 'Beef', expiry: '3-5 days', expiryDays: 4 },
  { name: 'Rice', expiry: '4-5 years', expiryDays: 1642 },
  { name: 'Pasta', expiry: '1-2 years', expiryDays: 547 },
  { name: 'Tomatoes', expiry: '1 week', expiryDays: 7 },
  { name: 'Lettuce', expiry: '7-10 days', expiryDays: 8.5 },
  { name: 'Apples', expiry: '4-6 weeks', expiryDays: 35 },
  { name: 'Bananas', expiry: '5-7 days', expiryDays: 6 },
  { name: 'Oranges', expiry: '3-4 weeks', expiryDays: 25 },
  { name: 'Coffee', expiry: '2-3 weeks', expiryDays: 17 },
  { name: 'Tea', expiry: '6-12 months', expiryDays: 270 },
  { name: 'Sugar', expiry: 'Indefinite', expiryDays: 3650 },
  { name: 'Salt', expiry: 'Indefinite', expiryDays: 3650 },
  { name: 'Pepper', expiry: '2-3 years', expiryDays: 912 },
  { name: 'Olive Oil', expiry: '18-24 months', expiryDays: 630 }
];

export const getSuggestions = (
  currentItems: Array<{ id: string; text: string; completed: boolean }>,
  allSuggestions: Suggestion[] = grocerySuggestions
) => {
  const currentItemTexts = currentItems.map(item => item.text.toLowerCase());
  return allSuggestions.filter(
    suggestion => !currentItemTexts.includes(suggestion.name.toLowerCase())
  ).slice(0, 6);
};

export const getExpiryColor = (expiryDays: number) => {
  if (expiryDays <= 2) return '#D32F2F'; // Dark red for 0-2 days
  if (expiryDays <= 5) return '#F44336'; // Red for 3-5 days
  if (expiryDays <= 7) return '#FF5722'; // Deep orange for 6-7 days
  if (expiryDays <= 14) return '#FF9800'; // Orange for 1-2 weeks
  if (expiryDays <= 30) return '#E6A500'; // Darker amber for 2-4 weeks (changed from #FFC107)
  if (expiryDays <= 90) return '#8BC34A'; // Light green for 1-3 months
  return '#4CAF50'; // Green for 3+ months
};
