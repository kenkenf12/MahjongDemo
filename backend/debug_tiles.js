const constants = require('./dist/constants');
console.log('Total tiles in STANDARD_TILE_SET:', constants.STANDARD_TILE_SET.length);
console.log('Expected:', constants.TILE_COUNTS.TOTAL);

// Count by suit
const suits = {};
constants.STANDARD_TILE_SET.forEach(tile => {
  const suit = tile.suit;
  suits[suit] = (suits[suit] || 0) + 1;
});
console.log('Tiles by suit:', suits);
