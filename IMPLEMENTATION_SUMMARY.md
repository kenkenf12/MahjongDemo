# Payment Calculator Implementation - Pre-Build Summary

## Current Status

✅ **Analysis Complete** – Ready to implement payment calculator  
❌ **No existing implementation** – Starting from scratch (as per your request)  
⚠️ **Clarifications Required** – 5 ambiguities flagged (see section 2 below)

---

## 1. Existing Architecture Analysis

### Current State
- **No implementation code exists** in the workspace
- Only specification documents are present
- Fresh start required for the payment calculation system

### Backend Structure (To Be Created)
```
backend/src/
├── game/
│   ├── Settlement.ts              ← NEW: Main payment calculation
│   ├── PaymentCalculator.ts       ← NEW: Mode-specific logic
│   └── PaymentModes.ts            ← NEW: Mode definitions
├── config/
│   └── PaymentConfig.ts           ← NEW: Configurable rules
└── tests/
    └── payment/
        ├── Settlement.test.ts
        ├── DisCardWin.test.ts
        ├── SelfDrawWin.test.ts
        └── PaoLiability.test.ts
```

---

## 2. Critical Ambiguities Flagged for Confirmation

### ❓ Ambiguity #1: Discard Payment Model
**Spec Reference**: SPEC_REVIEW.md Section 3.8

**Current Assumption**: All 3 losers pay equally to winner  
**Alternative**: Only the discarder pays (multiplied by 3)

**Example** (2 fan hand):
```
Current Assumption (All Losers Pay):
  Winner receives: 1 + 1 + 1 = 3 points

Alternative (Only Discarder):
  Winner receives: 3 points (from discarder paying 3×)
```

**Status**: ⚠️ NEEDS CONFIRMATION

---

### ❓ Ambiguity #2: Self-Draw vs. Discard Payment
**Spec Reference**: SPEC_REVIEW.md Section 3.3, Question 3

**Current Assumption**: Same payment for both modes  
**Alternative**: Self-draw pays less (e.g., half payment)

**Example** (2 fan hand, non-dealer):
```
Current Assumption (Same Payment):
  Discard: 1 + 1 + 1 = 3 points
  Self-Draw: 1 + 1 + 1 = 3 points

Alternative (Reduced Self-Draw):
  Discard: 1 + 1 + 1 = 3 points
  Self-Draw: 0.5 + 0.5 + 0.5 = 1.5 points (or 0+1+1=2)
```

**Status**: ⚠️ NEEDS CONFIRMATION

---

### ❓ Ambiguity #3: Kong Liability (Pao / 包)
**Spec Reference**: Not mentioned in specification

**Current Assumption**: Kong does not create special payment liability  
**Common HK Mahjong**: Kong declarant may pay extra if winner is reached

**Example**:
```
Current Assumption (No Kong Liability):
  Player A declares Kong
  Player B wins from next draw
  → Player A pays normally (1x fan)

Alternative (Kong Liability):
  Player A declares Kong
  Player B wins from next draw
  → Player A pays double (2x fan) or all players' contribution
```

**Status**: ⚠️ MISSING FROM SPEC – NEEDS DECISION

---

### ❓ Ambiguity #4: Maximum Payment Cap
**Spec Reference**: Not mentioned in specification

**Current Assumption**: No payment cap (scales indefinitely with fan)  
**Alternative**: Cap payments at maximum fan or maximum amount

**Example** (Max fan = 5):
```
Current Assumption (No Cap):
  Hand with 8 fan → Calculate as 8 fan

Alternative (Capped):
  Hand with 8 fan → Calculate as 5 fan (capped)
```

**Status**: ⚠️ OPTIONAL – Can be added anytime

---

### ❓ Ambiguity #5: Dealer Multiplier Direction
**Spec Reference**: SPEC_REVIEW.md Section 3.4

**Current Assumption**: Clear – dealer pays 2×, receives 2×  
**Status**: ✅ SEEMS CLEAR (but confirm if needed)

---

## 3. Payment Modes to Implement

### Mode 1: Discard Win (Ron / 榮)
- Winner claims discarded tile from another player
- Triggered by: Player plays a discard → other player claims it for win
- Payment calculation:
  - Who pays: Discarder + potentially other players
  - How much: Based on discarder's role (dealer/non-dealer) + winner role

**Implementation**: `DisCardWin.test.ts`

### Mode 2: Self-Draw Win (Tsumo / 摸)
- Winner draws from wall to complete their hand
- Triggered by: Player draws tile that completes winning combination
- Payment calculation:
  - Who pays: All 3 other players
  - How much: Based on winner's role (dealer/non-dealer)

**Implementation**: `SelfDrawWin.test.ts`

### Mode 3: Full Payment / Pao (包) Liability
- Special situation where specific player is liable for all payments
- Triggered by: Kong declaration or special drawing circumstances
- Payment calculation:
  - Who pays: Liable player (pays for all other losers)
  - How much: Typically multiplied amount

**Implementation**: `PaoLiability.test.ts`

**Status**: ⚠️ Not in spec – may not be implemented in MVP

---

## 4. Configuration Structure

### Configurable Parameters
```typescript
{
  // Base rates
  nonDealerBaseRate: 1,              // 1 point per fan
  dealerBaseRate: 1,                 // (before dealer multiplier)
  
  // Multipliers
  dealerWinsMultiplier: 2,           // Dealer receives 2×
  dealerLosesMultiplier: 2,          // Dealer pays 2×
  
  // Payment modes
  paymentModes: {
    discard: {
      allLosersContribute: true,     // ← FLAGGED: Needs confirmation
      payerMultiplier: 1
    },
    selfDraw: {
      reducedPayment: false,         // ← FLAGGED: Needs confirmation
      allMustPay: true
    },
    pao: {
      enabled: false                 // ← FLAGGED: Needs decision
    }
  },
  
  // Limits
  maxFanForCalculation: 0,           // 0 = no cap
  maxPaymentPerLoser: 0              // 0 = no cap
}
```

---

## 5. Files to Be Created

### Core Calculation Files
1. **backend/src/game/Settlement.ts**
   - Main payment calculation engine
   - Orchestrates all modes
   - Returns settlement breakdown

2. **backend/src/game/PaymentCalculator.ts**
   - Mode-specific calculation logic
   - Discard win calculator
   - Self-draw win calculator
   - Pao liability calculator

3. **backend/src/game/PaymentModes.ts**
   - Enum definitions
   - Mode interfaces
   - Mode constants

4. **backend/src/config/PaymentConfig.ts**
   - Configuration interface
   - Default config
   - Config validator

### Test Files
5. **backend/tests/payment/Settlement.test.ts**
   - Base settlement calculation tests
   - Dealer multiplier tests
   - Fan calculation tests

6. **backend/tests/payment/DiscardWin.test.ts**
   - Discard-only payment tests
   - All-losers-pay tests
   - Multiple scenarios

7. **backend/tests/payment/SelfDrawWin.test.ts**
   - Self-draw payment tests
   - Reduced payment tests (if applicable)
   - Dealer scenarios

8. **backend/tests/payment/PaoLiability.test.ts**
   - Kong liability tests (if implemented)
   - Pao payment scenarios
   - Validation tests

**Total**: 8 new files

---

## 6. Assumptions for MVP Implementation

✅ **Confirmed Assumptions** (from spec):
1. Winning hand: 4 melds + 1 pair ✓
2. Minimum fan: 1 fan ✓
3. Dealer multiplier: 2× ✓
4. Fan values as specified ✓

⚠️ **Provisional Assumptions** (waiting for confirmation):
1. Payment model: All 3 losers pay equally (not just discarder)
2. Self-draw: Same payment as discard (no bonus/penalty)
3. Kong liability: Not included in MVP (can be added later)
4. Payment cap: No maximum (scales with fan count)

---

## 7. Implementation Strategy

### Phase 1: Base Settlement (No Ambiguity)
- Implement core payment calculation with current spec assumptions
- Write tests for basic scenarios
- Should work immediately

### Phase 2: Mode-Specific Logic
- Implement Discard mode with all-losers-pay assumption
- Implement Self-Draw mode with same-payment assumption
- Add configuration support

### Phase 3: Validation & Edge Cases
- Add validation for invalid inputs
- Handle player scores
- Edge case testing

### Phase 4: Pao Mode (Optional)
- Only implement if confirmed needed
- Can be added/modified without affecting other modes

---

## 8. Test Coverage Plan

### Unit Tests (by mode)
- Discard Win: 15-20 test cases
- Self-Draw Win: 10-15 test cases
- Pao Liability: 10-15 test cases (if implemented)
- Settlement validation: 10 test cases

**Total**: 45-60 test cases

### Test Scenarios Covered
```
✓ Non-dealer wins
✓ Dealer wins
✓ Dealer loses
✓ Multiple fan counts (1, 2, 3, 5, 8)
✓ All positions (East, South, West, North)
✓ Invalid fan counts
✓ Edge cases (0 fan, negative fan)
✓ Configuration variations
✓ Payment limits (if capped)
✓ Calculation verification
```

---

## 9. Next Steps (In Order)

### Step 1: Get Confirmation ⚠️ (BLOCKING)
Please confirm or provide guidance on:
1. Discard payment model (all losers vs. only discarder)
2. Self-draw vs. discard payment difference
3. Kong liability (Pao) inclusion
4. Payment cap preferences

### Step 2: Create Backend Project Structure
- Initialize TypeScript configuration
- Set up package.json with dependencies
- Create directory structure

### Step 3: Implement Core Files
- Settlement.ts (base calculation)
- PaymentCalculator.ts (mode logic)
- PaymentConfig.ts (configuration)

### Step 4: Implement Tests
- Write comprehensive unit tests
- Validate all three modes
- Ensure 100% calculation accuracy

### Step 5: Documentation
- Document all calculation methods
- Provide usage examples
- Flag any rule clarifications made

---

## 10. Deliverables Summary

### Upon Completion, You Will Receive:

1. ✅ **Fully functional payment calculator**
   - All three modes working independently
   - Configurable rules
   - Separated from UI logic

2. ✅ **Comprehensive test suite**
   - 45-60 unit tests
   - All modes covered
   - Edge cases included

3. ✅ **Complete documentation**
   - Payment calculation logic
   - Configuration options
   - Usage examples

4. ✅ **Summary report**
   - Files created/modified
   - Test results
   - Rule clarifications made

---

## Current Blockers

❌ **Confirmation Needed On**:
- [ ] Discard payment: all losers or only discarder?
- [ ] Self-draw: same payment as discard or reduced?
- [ ] Pao: implement Kong liability?
- [ ] Cap: any payment maximums?

**Once confirmed**, implementation can proceed immediately (no other dependencies).

---

**Ready to proceed?** → Provide clarification on ambiguities, then implementation will begin.

