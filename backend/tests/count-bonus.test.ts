import { STANDARD_TILE_SET } from '../src/constants';
import { isBonus } from '../src/models/Tile';

describe('Bonus Tile Count', () => {
  test('count bonus tiles in STANDARD_TILE_SET', () => {
    const bonusCount = STANDARD_TILE_SET.filter(t => isBonus(t)).length;
    console.log('\nTotal tiles:', STANDARD_TILE_SET.length);
    console.log('Bonus tiles:', bonusCount);
    console.log('Regular tiles:', STANDARD_TILE_SET.length - bonusCount);
  });
});
