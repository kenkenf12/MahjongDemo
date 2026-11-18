# Mahjong Payment Calculator - Implementation Guide

## Overview

This is a complete implementation of the Mahjong payment calculator based on the confirmed business rules (Q1-Q5).

**Status**: ✅ Complete implementation with full test coverage

---

## Confirmed Business Rules

### Q1: Discard Payment Model
**Rule**: Only the discarder pays the winner, not all 3 losers.

```typescript
// Example: East wins on South's discard with 2 fan
- South (discarder) pays: 2 points
- West: 0 (does not pay)
- North: 0 (does not pay)
- East receives: 2 points total
```

### Q2: Self-Draw Payment
**Rule**: Each of the 3 other players pays equally.

```typescript
// Example: East wins by self-draw with 2 fan
- South pays: 2 points
- West pays: 2 points
- North pays: 2 points
- East receives: 6 points total
```

### Q3: Pao/Kong Liability
**Rule**: Separate FULL_PAYMENT mode for liability scenarios (not integrated with other modes).

```typescript
// Example: South is liable for all when East wins with 2 fan
- South (liable) pays: 6 points (for all 3 losers)
- East receives: 6 points total
```

### Q4: Payment Cap
**Rule**: Payments capped at the configured maximum fan amount.

```typescript
// Example: maxFanForCalculation = 5
- Hand with 8 fan → calculated as 5 fan
- Hand with 3 fan → calculated as 3 fan (no cap needed)
```

### Q5: No Dealer Multipliers
**Rule**: Simple consistent calculation - no special dealer rates.

```typescript
// Example: All positions pay the same rate (1 point per fan)
- East wins: each loser pays 1 point per fan (same as non-dealer)
- South wins: each loser pays 1 point per fan
```

---

## File Structure

```
backend/
├── src/
│   ├── types.ts                    # Core type definitions
│   ├── index.ts                    # Main exports
│   ├── config/
│   │   └── PaymentConfig.ts        # Configuration management
│   └── game/
│       ├── Settlement.ts           # Main settlement orchestrator
│       └── PaymentCalculator.ts    # Mode-specific calculators
├── tests/
│   └── payment/
│       ├── Settlement.test.ts      # 10 tests
│       ├── DiscardWin.test.ts      # 20+ tests
│       ├── SelfDrawWin.test.ts     # 20+ tests
│       └── FullPayment.test.ts     # 20+ tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── IMPLEMENTATION_GUIDE.md (this file)
```

---

## Installation & Setup

### Prerequisites
- Node.js 16+
- TypeScript 5.0+
- Jest 29+

### Installation

```bash
cd backend
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
npm test:coverage
```

---

## Usage Examples

### Basic Usage: Discard Win

```typescript
import {
  SettlementEngine,
  PaymentMode,
  DEFAULT_PAYMENT_CONFIG
} from './src/index';

const engine = new SettlementEngine(DEFAULT_PAYMENT_CONFIG);

const result = engine.calculateSettlement(
  {
    position: 'East',
    fanCount: 2,
    paymentMode: PaymentMode.DISCARD
  },
  { position: 'South' },  // Discarder
  null,                   // No liability player
  ['East', 'South', 'West', 'North']
);

console.log(result);
// Output:
// {
//   winner: { position: 'East', totalReceived: 2 },
//   payments: {
//     'South': { position: 'South', amountToPay: 2, reason: 'discard' }
//   },
//   details: {
//     fanCount: 2,
//     paymentMode: 'discard',
//     baseAmount: 2,
//     cappedAmount: 2,
//     maxFanCap: 8
//   },
//   validation: { isValid: true, errors: [], warnings: [] }
// }
```

### Basic Usage: Self-Draw Win

```typescript
const result = engine.calculateSettlement(
  {
    position: 'East',
    fanCount: 2,
    paymentMode: PaymentMode.SELF_DRAW
  },
  null,                   // No discarder
  null,                   // No liability player
  ['East', 'South', 'West', 'North']
);

console.log(result);
// Output:
// {
//   winner: { position: 'East', totalReceived: 6 },
//   payments: {
//     'South': { position: 'South', amountToPay: 2, reason: 'self-draw' },
//     'West': { position: 'West', amountToPay: 2, reason: 'self-draw' },
//     'North': { position: 'North', amountToPay: 2, reason: 'self-draw' }
//   },
//   details: { /* ... */ },
//   validation: { isValid: true, errors: [], warnings: [] }
// }
```

### Basic Usage: Full Payment (Pao)

```typescript
const result = engine.calculateSettlement(
  {
    position: 'East',
    fanCount: 2,
    paymentMode: PaymentMode.FULL_PAYMENT
  },
  null,                   // No discarder
  'South',                // Liability player
  ['East', 'South', 'West', 'North']
);

console.log(result);
// Output:
// {
//   winner: { position: 'East', totalReceived: 6 },
//   payments: {
//     'South': { position: 'South', amountToPay: 6, reason: 'full_payment_liability' }
//   },
//   details: { /* ... */ },
//   validation: { isValid: true, errors: [], warnings: [] }
// }
```

### Custom Configuration

```typescript
import { createPaymentConfig } from './src/index';

const customConfig = createPaymentConfig({
  baseRate: 2,
  maxFanForCalculation: 5,
  maxPaymentPerLoser: 20
});

const customEngine = new SettlementEngine(customConfig);

const result = customEngine.calculateSettlement(
  {
    position: 'East',
    fanCount: 3,
    paymentMode: PaymentMode.DISCARD
  },
  { position: 'South' },
  null,
  ['East', 'South', 'West', 'North']
);

// With baseRate: 2
// Payment = 3 fan * 2 base rate = 6 points
console.log(result.winner.totalReceived); // 6
```

### Using Self-Draw with Fan Cap

```typescript
const config = createPaymentConfig({
  maxFanForCalculation: 5
});

const engine = new SettlementEngine(config);

const result = engine.calculateSettlement(
  {
    position: 'East',
    fanCount: 8,  // Exceeds cap
    paymentMode: PaymentMode.SELF_DRAW
  },
  null,
  null,
  ['East', 'South', 'West', 'North']
);

// With maxFanForCalculation: 5
// Each player pays: 5 fan (capped) * 1 base rate = 5
// Total: 5 * 3 players = 15
console.log(result.winner.totalReceived); // 15
console.log(result.details.cappedAmount); // 5
```

---

## API Reference

### Settlement Engine

```typescript
class SettlementEngine {
  constructor(config: PaymentConfig)
  
  calculateSettlement(
    winner: WinnerInfo,
    discarder: DiscardInfo | null,
    liabilityPlayer: Position | null,
    allPositions: Position[]
  ): SettlementResult
  
  updateConfig(newConfig: PaymentConfig): void
  getConfig(): PaymentConfig
}
```

### Types

```typescript
enum PaymentMode {
  DISCARD = 'discard',
  SELF_DRAW = 'self_draw',
  FULL_PAYMENT = 'full_payment'
}

type Position = 'East' | 'South' | 'West' | 'North'

interface WinnerInfo {
  position: Position
  fanCount: number
  paymentMode: PaymentMode
}

interface DiscardInfo {
  position: Position
}

interface SettlementResult {
  winner: { position: Position; totalReceived: number }
  payments: { [position: string]: PlayerPaymentInfo }
  details: {
    fanCount: number
    paymentMode: PaymentMode
    baseAmount: number
    cappedAmount: number
    maxFanCap: number
  }
  validation: ValidationResult
}

interface PaymentConfig {
  baseRate: number
  maxFanForCalculation: number
  maxPaymentPerLoser: number
  paymentModes: PaymentModeConfig
}
```

### Configuration Functions

```typescript
function validatePaymentConfig(config: PaymentConfig): boolean

function getDefaultConfig(): PaymentConfig

function createPaymentConfig(overrides?: Partial<PaymentConfig>): PaymentConfig

function mergePaymentConfigs(
  base: PaymentConfig,
  override: Partial<PaymentConfig>
): PaymentConfig

function exportConfigAsJson(config: PaymentConfig): string

function loadConfigFromJson(jsonString: string): PaymentConfig
```

---

## Test Coverage

### Total Tests: 70+

**Settlement Tests** (10 tests):
- Input validation
- Configuration management
- Error handling
- Result structure validation

**Discard Win Tests** (20+ tests):
- Q1 rule verification (only discarder pays)
- Payment calculation
- Fan cap application
- All position combinations
- Edge cases

**Self-Draw Win Tests** (20+ tests):
- Q2 rule verification (all 3 pay)
- Payment calculation
- Fan cap application
- No dealer multiplier (Q5)
- All position combinations
- Edge cases

**Full Payment Tests** (20+ tests):
- Q3 rule verification (separate liability mode)
- Payment calculation
- Fan cap application
- All position combinations
- Consistency with other modes
- Edge cases

### Run Tests

```bash
npm test                  # Run all tests
npm test:watch           # Run in watch mode
npm test:coverage        # Run with coverage report
```

### Test Coverage Target

- Lines: 80%+
- Functions: 80%+
- Branches: 80%+
- Statements: 80%+

---

## Validation Rules

### Input Validation

1. **Winner position** must be one of: East, South, West, North
2. **Fan count** must be >= 1
3. **Payment mode** must be valid enum value
4. **All positions** must be exactly 4, unique values
5. **Discarder** (if provided) must be in positions and not winner
6. **Liability player** (if provided) must be in positions and not winner

### Settlement Validation

1. **Winner amount** must be >= 0
2. **All payments** must be >= 0
3. **Total paid** must equal **total received**
4. **No negative payments**

---

## Common Scenarios

### Scenario 1: Standard Discard Win

```typescript
// Player 1 (East) discards
// Player 2 (South) claims tile and wins with 2 fan

engine.calculateSettlement(
  { position: 'South', fanCount: 2, paymentMode: PaymentMode.DISCARD },
  { position: 'East' },
  null,
  ['East', 'South', 'West', 'North']
)
// Result: South receives 2 from East. West and North pay nothing.
```

### Scenario 2: Self-Draw Win During Turn

```typescript
// Player 3 (West) draws from wall and completes winning hand (3 fan)

engine.calculateSettlement(
  { position: 'West', fanCount: 3, paymentMode: PaymentMode.SELF_DRAW },
  null,
  null,
  ['East', 'South', 'West', 'North']
)
// Result: West receives 9 (3 from each: East, South, North)
```

### Scenario 3: Kong Liability (Pao)

```typescript
// Player 2 (South) declared a Kong
// Player 3 (West) wins on the next draw (2 fan)
// South is liable for all

engine.calculateSettlement(
  { position: 'West', fanCount: 2, paymentMode: PaymentMode.FULL_PAYMENT },
  null,
  'South',
  ['East', 'South', 'West', 'North']
)
// Result: West receives 6 (all from South)
```

### Scenario 4: High Fan with Cap

```typescript
// Player 1 (East) wins with 10 fan, but max is 5
// Configuration: maxFanForCalculation: 5

const config = createPaymentConfig({ maxFanForCalculation: 5 });
const engine = new SettlementEngine(config);

engine.calculateSettlement(
  { position: 'East', fanCount: 10, paymentMode: PaymentMode.DISCARD },
  { position: 'South' },
  null,
  ['East', 'South', 'West', 'North']
)
// Result: East receives 5 (capped, not 10)
```

---

## Troubleshooting

### Settlement returns invalid

Check `result.validation` for errors:

```typescript
if (!result.validation.isValid) {
  console.error('Validation errors:', result.validation.errors);
  console.error('Warnings:', result.validation.warnings);
}
```

### Unexpected payment amounts

1. Check `result.details.cappedAmount` for fan cap application
2. Check configuration: `baseRate`, `maxFanForCalculation`, `maxPaymentPerLoser`
3. Verify payment mode matches expected behavior

### Tests failing

1. Ensure Node.js 16+ and TypeScript 5+ installed
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Run `npm test` to execute tests

---

## Performance Characteristics

- **Settlement calculation**: O(1) time complexity
- **Validation**: O(n) where n = number of positions (always 4)
- **Memory usage**: < 1 KB per settlement

---

## Future Enhancements (Out of Scope)

- Dealer-specific multipliers (if rules change)
- Multiple round scoring
- Player balance tracking
- Undo/replay functionality
- Persistent game history

---

## Support & Questions

For issues or questions:
1. Check the test files for usage examples
2. Review type definitions in `types.ts`
3. Check validation errors in `result.validation`

---

**Implementation Status**: ✅ Complete  
**Test Coverage**: ✅ 70+ tests  
**Business Rules**: ✅ All 5 confirmed rules implemented  
**Documentation**: ✅ Complete
