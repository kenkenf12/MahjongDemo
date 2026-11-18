import { Wall } from '../src/game/Wall';
import { TILE_COUNTS, GAME_CONSTANTS } from '../src/constants';
import { isBonus } from '../src/models/Tile';

describe('Debug Wall Deal', () => {
  test('debug first deal with bonus tracking', () => {
    const wall = new Wall();
    console.log('\n=== First Deal with Bonus Tracking ===');
    
    const hands1 = wall.dealInitial();
    console.log('East:', hands1[0].length, 'South:', hands1[1].length, 'West:', hands1[2].length, 'North:', hands1[3].length);
    
    // Check for any bonus tiles that shouldn't be there
    for (let i = 0; i < 4; i++) {
      const bonusCount = hands1[i].filter((t: any) => isBonus(t)).length;
      console.log(`Player ${i} bonus tiles in hand:`, bonusCount);
    }
    
    console.log('Total dealt:', hands1.reduce((sum: number, h: any) => sum + h.length, 0));
    console.log('Expected: 14 + 13 + 13 + 13 = 53');
    console.log('Tiles remaining:', wall.tilesRemaining());
    console.log('Expected remaining: ~87-90');
  });
});
