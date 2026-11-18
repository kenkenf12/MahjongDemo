# Payment Calculator Implementation - Complete Index

## Quick Navigation

### For Quick Overview (5 min)
- **START HERE**: `READY_FOR_IMPLEMENTATION.txt` – Visual checklist and 5 questions

### For Detailed Analysis (20 min)
- **PAYMENT_RULES_ANALYSIS.md** – Complete specification review and architecture
- **IMPLEMENTATION_SUMMARY.md** – Pre-build summary and deliverables

### For Reference During Implementation (ongoing)
- **This file** – Quick links and decision log

---

## The 5 Critical Questions (Answer These First)

### Question 1: Discard Payment Model
**Current Assumption**: All 3 losers pay equally  
**Alternative**: Only discarder pays (multiplied by 3)

**Your Answer**:  
```
☐ (a) All 3 losers pay equally
☐ (b) Only discarder pays (multiplied)
☐ (c) Other (explain): ________________
```

---

### Question 2: Self-Draw vs. Discard Payment
**Current Assumption**: Same payment for both modes  
**Alternative**: Self-draw pays less (e.g., half)

**Your Answer**:  
```
☐ (a) Same payment as discard
☐ (b) Self-draw pays less (specify): ________________
☐ (c) Different calculation (explain): ________________
```

---

### Question 3: Kong Liability (Pao / 包)
**Current Assumption**: Kong does not create special liability  
**Alternative**: Kong declarant pays extra

**Your Answer**:  
```
☐ (a) No special Kong liability
☐ (b) Kong declarant pays double
☐ (c) Kong declarant pays for all players
☐ (d) Other (explain): ________________
```

---

### Question 4: Payment Cap
**Current Assumption**: No maximum (scales with fan count)  
**Alternative**: Cap at maximum fan or amount

**Your Answer**:  
```
☐ (a) No cap (unlimited scaling)
☐ (b) Cap at max fan (specify): ________________
☐ (c) Cap at max amount (specify): ________________
```

---

### Question 5: Dealer Multiplier (Confirm Interpretation)
**Current Spec**: Dealer pays/receives 2×  
**Question**: Is this calculation correct?

**Example**:
```
Dealer wins by 2 fan:
  Each loser pays: 2 × 2 = 4 points
  Total received: 12 points

Dealer loses by 2 fan:
  Dealer pays: 2 × 2 = 4 points
  Others pay: 1 × 2 = 2 points each
  Total loser receives: 8 points
```

**Your Answer**:  
```
☐ (a) Yes, this is correct
☐ (b) No, it should be (explain): ________________
```

---

## Implementation Files (8 Total)

### Core Files (4)

#### 1. `backend/src/game/Settlement.ts`
- **Purpose**: Main payment calculation orchestrator
- **Responsibility**: 
  - Accept winner info and game state
  - Route to appropriate payment mode
  - Return settlement breakdown
- **Key Functions**:
  - `calculateSettlement(winnerInfo, gameState): Settlement`
  - `validateSettlement(settlement): ValidationResult`

#### 2. `backend/src/game/PaymentCalculator.ts`
- **Purpose**: Mode-specific calculation logic
- **Responsibility**:
  - Implement Discard win payments
  - Implement Self-draw win payments
  - Implement Pao liability (if enabled)
- **Key Functions**:
  - `calculateDiscardWin(...): Payment`
  - `calculateSelfDrawWin(...): Payment`
  - `calculatePaoLiability(...): Payment`

#### 3. `backend/src/game/PaymentModes.ts`
- **Purpose**: Mode definitions and constants
- **Responsibility**:
  - Define PaymentMode enum
  - Define mode interfaces
  - Define mode validation rules
- **Key Content**:
  - `enum PaymentMode { DISCARD, SELF_DRAW, PAO }`
  - `interface PaymentRequest`
  - `interface PaymentResponse`

#### 4. `backend/src/config/PaymentConfig.ts`
- **Purpose**: Configuration management
- **Responsibility**:
  - Define configurable parameters
  - Provide default values
  - Validate configuration
- **Key Functions**:
  - `getDefaultConfig(): PaymentConfig`
  - `validateConfig(config): boolean`
  - `loadConfig(filePath): PaymentConfig`

### Test Files (4)

#### 5. `backend/tests/payment/Settlement.test.ts`
- **Test Count**: 10 tests
- **Scenarios**:
  - Non-dealer wins (all positions)
  - Dealer wins (all situations)
  - Dealer loses (settlement validation)
  - Fan count calculations (1, 2, 3, 5, 8)
  - Multiplier application

#### 6. `backend/tests/payment/DiscardWin.test.ts`
- **Test Count**: 15-20 tests
- **Scenarios**:
  - All loser contribution (if selected)
  - Only discarder payment (if selected)
  - Dealer vs. non-dealer discarder
  - Multiple fan counts
  - Edge cases (0 fan, invalid fan)

#### 7. `backend/tests/payment/SelfDrawWin.test.ts`
- **Test Count**: 10-15 tests
- **Scenarios**:
  - All players pay equally (if selected)
  - Reduced payment model (if selected)
  - Dealer self-draw (3x payment or 2x)
  - Non-dealer self-draw
  - Configuration variations

#### 8. `backend/tests/payment/PaoLiability.test.ts`
- **Test Count**: 10-15 tests (only if implemented)
- **Scenarios**:
  - Kong declaration -> liability
  - Kong discard -> liability
  - Liability multiplier application
  - Mixed scenarios with other modes
  - Edge cases

---

## Decision Log

### Decisions Made

✅ **Architecture Decision 1**: Separation of Concerns
- Payment calculation separate from game logic
- Configuration separate from implementation
- Tests independent of UI

✅ **Architecture Decision 2**: Three Independent Modes
- Each mode can be tested in isolation
- Each mode can be enabled/disabled via config
- New modes can be added without modifying existing code

✅ **Architecture Decision 3**: Configurable Rules
- All payment parameters are configurable
- Rules can be changed without code modifications
- Default rules match specification assumptions

### Clarifications Made During Analysis

⚠️ **Clarification 1: "Each Loser Pays"**
- Spec says: "each loser pays 1× fan value"
- Issue: Typical HK Mahjong only discarder pays
- Status: Will implement as spec says, but flagged as ambiguous

⚠️ **Clarification 2: Self-Draw Bonus**
- Spec says: "assumed NO self-draw bonus"
- Issue: Common in HK Mahjong to have different payments
- Status: Will implement equal payments unless confirmed otherwise

⚠️ **Clarification 3: Kong Liability**
- Spec: Does not mention Pao/Kong liability
- Issue: Common in HK Mahjong
- Status: Deferred to optional Phase 4

---

## Implementation Phases

### Phase 1: Base Settlement (1-2 hours)
```
Deliverable: Settlement.ts
Tests: 10 basic tests
Input: Winner info, game state
Output: Payment amounts
Status: Core functionality, no ambiguity
```

### Phase 2: Mode-Specific Logic (2-3 hours)
```
Deliverable: PaymentCalculator.ts + modes
Tests: 40-50 mode-specific tests
Covers: Discard, Self-Draw, Pao (optional)
Status: Implements with provisional assumptions
```

### Phase 3: Validation & Configuration (1-2 hours)
```
Deliverable: PaymentConfig.ts + validation
Tests: Integration tests
Covers: Config loading, error handling
Status: Extensible for future rules
```

### Phase 4: Pao Mode (1-2 hours, optional)
```
Deliverable: Enhanced PaymentCalculator.ts
Tests: 15+ Pao-specific tests
Covers: Kong liability scenarios
Status: Only after Phase 1-3 complete AND confirmed needed
```

---

## Testing Strategy

### Unit Tests: 60+ total
```
Settlement.test.ts:      10 tests
DiscardWin.test.ts:      15-20 tests
SelfDrawWin.test.ts:     10-15 tests
PaoLiability.test.ts:    10-15 tests (optional)
──────────────────────────────────
Total:                   45-60 tests
```

### Test Coverage
```
✓ All payment modes
✓ All dealer positions (East, South, West, North)
✓ Multiple fan counts (1, 2, 3, 5, 8)
✓ All multiplier scenarios
✓ Edge cases (0 fan, negative, invalid)
✓ Configuration variations
✓ Error handling
```

### Test Execution
```
npm test -- payment/
→ Runs all payment tests
→ Shows coverage report
→ Validates all modes work correctly
```

---

## Configuration Examples

### Default Configuration (Current Specification)
```typescript
{
  nonDealerBaseRate: 1,
  dealerBaseRate: 1,
  dealerWinsMultiplier: 2,
  dealerLosesMultiplier: 2,
  
  paymentModes: {
    discard: {
      allLosersContribute: true,
      payerMultiplier: 1
    },
    selfDraw: {
      reducedPayment: false,
      allMustPay: true
    },
    pao: {
      enabled: false
    }
  },
  
  maxFanForCalculation: 0,
  maxPaymentPerLoser: 0
}
```

### Alternative Configuration (Variant Rules)
```typescript
{
  // Same but with modifications:
  paymentModes: {
    discard: {
      allLosersContribute: false,  // ← Only discarder pays
      payerMultiplier: 3           // ← Multiplied by 3
    },
    selfDraw: {
      reducedPayment: true,        // ← Half payment
      allMustPay: true
    },
    pao: {
      enabled: true                // ← Enable Kong liability
    }
  },
  
  maxFanForCalculation: 5,         // ← Cap at 5 fan
  maxPaymentPerLoser: 20           // ← Cap payment to 20 points
}
```

---

## Usage Examples

### Basic Usage
```typescript
const settlement = settlementCalculator.calculateSettlement({
  winner: {
    position: 'South',
    isDealer: false,
    fanCount: 2,
    paymentMode: PaymentMode.DISCARD_WIN
  },
  discarder: {
    position: 'East',
    isDealer: true
  },
  config: defaultConfig
});

console.log(settlement.payments);
// {
//   'South': { received: 6 },
//   'East': { paid: 4 },
//   'West': { paid: 1 },
//   'North': { paid: 1 }
// }
```

### With Configuration Override
```typescript
const customConfig = { ...defaultConfig };
customConfig.paymentModes.discard.allLosersContribute = false;

const settlement = settlementCalculator.calculateSettlement({
  winner,
  discarder,
  config: customConfig
});

// Different results based on configuration
```

---

## Deliverables Checklist

### Upon Completion, You Will Receive:

- [ ] **4 Core Implementation Files**
  - [ ] Settlement.ts
  - [ ] PaymentCalculator.ts
  - [ ] PaymentModes.ts
  - [ ] PaymentConfig.ts

- [ ] **4 Test Files**
  - [ ] Settlement.test.ts
  - [ ] DiscardWin.test.ts
  - [ ] SelfDrawWin.test.ts
  - [ ] PaoLiability.test.ts (if implemented)

- [ ] **Complete Test Coverage**
  - [ ] 60+ passing tests
  - [ ] All modes validated
  - [ ] Edge cases covered

- [ ] **Documentation**
  - [ ] Code comments explaining logic
  - [ ] Usage examples
  - [ ] Configuration options documented
  - [ ] Rule clarifications noted

- [ ] **Summary Report**
  - [ ] Files created/modified
  - [ ] Test results
  - [ ] Implementation decisions made
  - [ ] Assumptions confirmed or updated

---

## Common Questions (FAQ)

### Q: Will existing code be preserved?
**A**: Yes. New payment calculator will be isolated in dedicated files. No modifications to existing files unless they exist (they don't currently).

### Q: Can the payment model be changed later?
**A**: Yes. Configuration is extensible. Rules can be modified without changing code logic.

### Q: What if specifications change after implementation?
**A**: Tests will fail immediately, showing exactly what changed. Easy to update PaymentConfig and tests.

### Q: Are there any dependencies on other modules?
**A**: Minimal. Only depends on:
- Basic types (Position, PaymentMode enums)
- Configuration interface
- No dependencies on game logic or UI

### Q: Can I use this in production?
**A**: Yes, once clarifications are confirmed and tests pass. MVP implementation is solid and extensible.

---

## Next Steps

1. **Answer the 5 questions** above
2. **Share your answers** with confirmation on ambiguities
3. **I will implement** all 8 files with tests
4. **You will receive** complete working implementation + summary

**Estimated time after confirmation**: 5-9 hours for complete MVP

---

**Status**: ✅ Analysis Complete – Awaiting Your Confirmation  
**Last Updated**: 2024-11-18
