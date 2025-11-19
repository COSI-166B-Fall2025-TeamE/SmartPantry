// app/utils/emojiUtils.ts
export const getItemEmoji = (itemName: string): string | null => {
  function getLastWord(name: string): string {
  const words = name.trim().split(/\s+/);
  return words[words.length - 1];
}
 
  const lowerName = getLastWord(itemName.toLowerCase());
  
  // fruits
  if (lowerName.includes('apple')) return '🍎';
  if (lowerName.includes('banana')) return '🍌';
  if (lowerName.includes('orange')) return '🍊';
  if (lowerName.includes('lemon')) return '🍋';
  if (lowerName.includes('grape')) return '🍇';
  if (lowerName.includes('strawber')) return '🍓';
  if (lowerName.includes('watermelon')) return '🍉';
  if (lowerName.includes('pineapple')) return '🍍';
  if (lowerName.includes('peach')) return '🍑';
  if (lowerName.includes('cher')) return '🍒';
  if (lowerName.includes('mango')) return '🥭';
  if (lowerName.includes('kiwi')) return '🥝';
  if (lowerName.includes('coconut')) return '🥥';
  if (lowerName.includes('avocado')) return '🥑';
  if (lowerName.includes('blueber')) return '🫐';
  if (lowerName.includes('raspber')) return '🍇';
  
  // vegetable
if (lowerName.includes('carrot')) return '🥕';
if (lowerName.includes('corn')) return '🌽';
if (lowerName.includes('salad') || lowerName.includes('lettuce')) return '🥬';
if (lowerName.includes('broccoli')) return '🥦';
if (lowerName.includes('cucumber')) return '🥒';
if (lowerName.includes('tomato')) return '🍅';
if (lowerName.includes('chili') || lowerName.includes('pepper')) return '🌶️';
if (lowerName.includes('potato')) return '🥔';
if (lowerName.includes('onion')) return '🧅';
if (lowerName.includes('garlic')) return '🧄';
if (lowerName.includes('mushroom')) return '🍄';
if (lowerName.includes('bean')) return '🫘';
if (lowerName.includes('eggplant')) return '🍆';
if (lowerName.includes('pumpkin')) return '🎃';
  
  // dairy
  if (lowerName.includes('milk')) return '🥛';
  if (lowerName.includes('cheese')) return '🧀';
  if (lowerName.includes('butter')) return '🧈';
  if (lowerName.includes('yogurt')) return '🥛';
  
  // protein
  if (lowerName.includes('egg')) return '🥚';
  if (lowerName.includes('chicken')) return '🍗';
  if (lowerName.includes('meat')) return '🥩';
  if (lowerName.includes('fish')) return '🐟';
  if (lowerName.includes('shrimp')) return '🦐';
  if (lowerName.includes('crab')) return '🦀';
  if (lowerName.includes('lobster')) return '🦞';
  if (lowerName.includes('sausage')) return '🌭';
  if (lowerName.includes('bacon')) return '🥓';
  

  if (lowerName.includes('bread')) return '🍞';
  if (lowerName.includes('croissant')) return '🥐';
  if (lowerName.includes('bagel')) return '🥯';
  if (lowerName.includes('pancake')) return '🥞';
  if (lowerName.includes('waffle')) return '🧇';
  if (lowerName.includes('rice')) return '🍚';
  if (lowerName.includes('pasta')) return '🍝';
  if (lowerName.includes('noodle')) return '🍜';
  
  // snacks
  if (lowerName.includes('cookie')) return '🍪';
  if (lowerName.includes('cake')) return '🍰';
  if (lowerName.includes('pie')) return '🥧';
  if (lowerName.includes('chocolate')) return '🍫';
  if (lowerName.includes('candy')) return '🍬';
  if (lowerName.includes('icecream')) return '🍦';
  if (lowerName.includes('donut')) return '🍩';
  if (lowerName.includes('popcorn')) return '🍿';
  if (lowerName.includes('pretzel')) return '🥨';
  
  // drinks
  if (lowerName.includes('coffee')) return '☕';
  if (lowerName.includes('tea')) return '🍵';
  if (lowerName.includes('beer')) return '🍺';
  if (lowerName.includes('wine')) return '🍷';
  if (lowerName.includes('cocktail')) return '🍸';
  if (lowerName.includes('juice')) return '🧃';
  if (lowerName.includes('soda')) return '🥤';
  
  // nuts
  if (lowerName.includes('peanut')) return '🥜';
  if (lowerName.includes('chestnut')|| lowerName.includes('pine')) return '🌰';
  
  // Spices and Seasonings
  if (lowerName.includes('salt')) return '🧂';
  if ((lowerName.includes('herb')) || lowerName.includes('parsley')) return '🌿';
  if (lowerName.includes('ketchup')) return '🥫';
  
  // often seen foods
  if (lowerName.includes('honey')) return '🍯';
  if (lowerName.includes('jam')) return '🍯';
  if (lowerName.includes('pizza')) return '🍕';
  if (lowerName.includes('hamburger')) return '🍔';
  if (lowerName.includes('hotdog')) return '🌭';
  if (lowerName.includes('sandwich')) return '🥪';
  if (lowerName.includes('taco')) return '🌮';
  if (lowerName.includes('burrito')) return '🌯';
  if (lowerName.includes('fries')) return '🍟';
  if (lowerName.includes('salad')) return '🥗';
  if (lowerName.includes('soup')) return '🍲';
  
  //cannot find
  return null;
};

export default getItemEmoji;