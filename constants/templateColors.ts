const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    card: '#E8EAF6',
    border: '#e0e0e0',
    inputBackground: '#fff',
    searchBar: 'rgba(128, 128, 128, 0.1)',
    buttonBackground: '#371B34',
    buttonText: '#fff',
    secondaryButton: '#f0f0f0',
    secondaryButtonText: '#666',
    expiringCard: '#E8EAF6', // Light mode expiring soon card
    scanCard: '#AFE9B2',
    manualCard: '#FCF9F9',
  },
  dark: {
    text: '#fff',
    background: '#1f1f1f',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    card: '#3E4055',
    border: '#4A4E6B',
    inputBackground: '#2F3142',
    searchBar: 'rgba(128, 128, 128, 0.1)',
    buttonBackground: '#CDD0E3',
    buttonText: '#371B34',
    secondaryButton: '#4A4E6B',
    secondaryButtonText: '#fff',
    expiringCard: '#3E4055', // Dark mode expiring soon card - your requested color
    scanCard: '#6AB46D',
    manualCard: '#E99B00',
  },
};
