import { Wall } from '../src/game/Wall';
import { isBonus } from '../src/models/Tile';

describe('Debug Wall Reset', () => {
  test('debug reset scenario', () => {
    const wall = new Wall();
    
    console.log('\n=== First Deal ===');
    const hands1 = wall.dealInitial();
    console.log('East:', hands1[0].length, 'Total:', hands1.reduce((s: number, h: any) => s + h.length, 0));
    
    console.log('\n=== Reset ===');
    wall.reset();
    
    console.log('=== Second Deal (same wall after reset) ===');
    const hands2 = wall.dealInitial();
    console.log('East:', hands2[0].length, 'Total:', hands2.reduce((s: number, h: any) => s + h.length, 0));
    
    console.log('\n=== Multiple resets ===');
    for (let i = 0; i < 5; i++) {
      wall.reset();
      const hands = wall.dealInitial();
      console.log(`Deal ${i + 3}: East=${hands[0].length}, Total=${hands.reduce((s: number, h: any) => s + h.length, 0)}`);
    }
  });
});
