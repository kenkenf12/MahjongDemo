/**
 * Full Payment (Pao) Test Tests
 *
 * CONFIRMED RULE Q3: Separate payment mode for liability (Pao)
 *
 * Tests the full payment mode where:
 * - A specific player is liable for all payments
 * - Typically used for Kong liability scenarios
 * - Liability player pays for all 3 losing players' share
 */

import { SettlementEngine } from '../../src/game/Settlement';
import { PaymentMode, DEFAULT_PAYMENT_CONFIG } from '../../src/types';
import { createPaymentConfig } from '../../src/config/PaymentConfig';

describe('Full Payment / Pao Liability (Q3 Confirmed)', () => {
  let engine: SettlementEngine;
  const allPositions: Array<'East' | 'South' | 'West' | 'North'> = [
    'East',
    'South',
    'West',
    'North'
  ];

  beforeEach(() => {
    engine = new SettlementEngine(DEFAULT_PAYMENT_CONFIG);
  });

  describe('Q3 Rule: Separate Liability Mode', () => {
    test('should have only liability player in payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South', // Liability player
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(Object.keys(result.payments)).toHaveLength(1);
      expect(result.payments['South']).toBeDefined();
    });

    test('should not include winner in payments', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['East']).toBeUndefined();
    });

    test('should only include liability player', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['West']).toBeUndefined();
      expect(result.payments['North']).toBeUndefined();
    });
  });

  describe('Payment Calculation', () => {
    test('should calculate total as fan * base rate * 3', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // 2 fan * 1 base rate * 3 players = 6
      expect(result.payments['South'].amountToPay).toBe(6);
      expect(result.winner.totalReceived).toBe(6);
    });

    test('should calculate correctly for 1 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(3); // 1 fan * 1 base rate * 3
      expect(result.winner.totalReceived).toBe(3);
    });

    test('should calculate correctly for 5 fan', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 5,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(15); // 5 fan * 1 base rate * 3
      expect(result.winner.totalReceived).toBe(15);
    });

    test('should apply custom base rate', () => {
      const config = createPaymentConfig({ baseRate: 2 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // 2 fan * 2 base rate * 3 = 12
      expect(result.payments['South'].amountToPay).toBe(12);
      expect(result.winner.totalReceived).toBe(12);
    });
  });

  describe('Fan Cap (Q4 Confirmed)', () => {
    test('should apply fan cap when fan exceeds maximum', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 5 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 8,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // 5 fan (capped) * 1 base rate * 3 = 15
      expect(result.details.cappedAmount).toBe(5);
      expect(result.payments['South'].amountToPay).toBe(15);
      expect(result.winner.totalReceived).toBe(15);
    });

    test('should not apply cap when fan is below maximum', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 5 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.details.cappedAmount).toBe(3);
      expect(result.payments['South'].amountToPay).toBe(9); // 3 * 3
    });

    test('should not apply cap when maxFanForCalculation is 0', () => {
      const config = createPaymentConfig({ maxFanForCalculation: 0 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 100,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['South'].amountToPay).toBe(300); // 100 * 3
    });
  });

  describe('Per-Loser Payment Cap', () => {
    test('should apply per-loser cap multiplied by 3', () => {
      const config = createPaymentConfig({ maxPaymentPerLoser: 10 });
      const customEngine = new SettlementEngine(config);

      const result = customEngine.calculateSettlement(
        {
          position: 'East',
          fanCount: 20,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // Cap per loser is 10, total for 3 = 30
      expect(result.payments['South'].amountToPay).toBe(30);
      expect(result.winner.totalReceived).toBe(30);
    });
  });

  describe('All Position Combinations', () => {
    test('should work with East as liability player', () => {
      const result = engine.calculateSettlement(
        {
          position: 'South',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'East',
        allPositions
      );

      expect(result.payments['East']).toBeDefined();
      expect(result.payments['East'].amountToPay).toBe(6);
    });

    test('should work with South as liability player', () => {
      const result = engine.calculateSettlement(
        {
          position: 'West',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['South']).toBeDefined();
      expect(result.payments['South'].amountToPay).toBe(6);
    });

    test('should work with West as liability player', () => {
      const result = engine.calculateSettlement(
        {
          position: 'North',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'West',
        allPositions
      );

      expect(result.payments['West']).toBeDefined();
      expect(result.payments['West'].amountToPay).toBe(6);
    });

    test('should work with North as liability player', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'North',
        allPositions
      );

      expect(result.payments['North']).toBeDefined();
      expect(result.payments['North'].amountToPay).toBe(6);
    });
  });

  describe('Edge Cases', () => {
    test('should handle 1 fan (minimum)', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 1,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.payments['South'].amountToPay).toBe(3);
    });

    test('should handle high fan count', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 50,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.payments['South'].amountToPay).toBe(150); // 50 * 3
    });

    test('should include reason in payment', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.payments['South'].reason).toBe('full_payment_liability');
    });
  });

  describe('Validation', () => {
    test('should reject when liability player is winner', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'East', // Same as winner
        allPositions
      );

      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('Liability player'))).toBe(true);
    });

    test('should mark settlement valid for valid input', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors).toHaveLength(0);
    });

    test('should ensure total paid equals total received', () => {
      const result = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 3,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      const totalPaid = Object.values(result.payments).reduce(
        (sum, p) => sum + p.amountToPay,
        0
      );
      expect(totalPaid).toBe(result.winner.totalReceived);
    });
  });

  describe('Consistency with Other Modes', () => {
    test('should pay 3x what self-draw pays per player', () => {
      const selfDrawResult = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.SELF_DRAW
        },
        null,
        null,
        allPositions
      );

      const fullPaymentResult = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // Full payment has 1 player paying 3x what self-draw 3 players pay
      // Actually, full payment total = self-draw total (both 6)
      // But full payment has 1 player paying all
      expect(fullPaymentResult.winner.totalReceived).toBe(
        selfDrawResult.winner.totalReceived
      );
    });

    test('should pay 3x what discard pays', () => {
      const discardResult = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.DISCARD
        },
        { position: 'South' },
        null,
        allPositions
      );

      const fullPaymentResult = engine.calculateSettlement(
        {
          position: 'East',
          fanCount: 2,
          paymentMode: PaymentMode.FULL_PAYMENT
        },
        null,
        'South',
        allPositions
      );

      // Full payment total should be 3x discard (if South is liable for all)
      expect(fullPaymentResult.winner.totalReceived).toBe(
        discardResult.winner.totalReceived * 3
      );
    });
  });
});
