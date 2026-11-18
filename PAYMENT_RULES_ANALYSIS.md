# Payment Rules Analysis & Calculator Architecture

## Executive Summary

Based on SPEC_REVIEW.md Section 3 and REQUIREMENTS.md, this document outlines:
1. **Current payment rule assumptions** in the specification
2. **Three independent payment modes** to implement
3. **Architecture for the payment calculator**
4. **Files that need to be created**
5. **Ambiguities flagged for confirmation**

---

## 1. Payment Rules from Specification

### 1.1 Base Payment Model (Section 3.8)

**Current Assumption: Full Settlement**

A winner is paid based on **fan count**:
- **Dealer wins**: All 3 losers pay 2× fan value each
- **Non-dealer wins**: All 3 losers pay 1× fan value each
- **Dealer loses**: Dealer pays 2× fan value to winner; non-dealers pay 1× fan value each
- **Draw game**: No payments made

**Example** (Dealer scenario):
- Dealer wins with 2 fan
  - Player 1 pays: 2 × 2 = 4 (to dealer)
  - Player 2 pays: 2 × 2 = 4 (to dealer)
  - Player 3 pays: 2 × 2 = 4 (to dealer)
  - Dealer receives: +12 total

- Dealer loses with 2 fan (South player wins)
  - Dealer pays: 2 × 2 = 4 (to South)
  - Player 2 pays: 2 × 1 = 2 (to South)
  - Player 3 pays: 2 × 1 = 2 (to South)
  - South receives: +8 total

### 1.2 Fan Values (Section 3.3)

Assumed fan scoring:
- **Pong** (exposed triplet): 1 fan
- **Kong** (concealed): 2 fan
- **Kong** (exposed): 1 fan
- **Flower tile**: 1 fan per tile
- **Season tile**: 1 fan per tile
- **All Simples** (2–8 tiles): 2 fan
- **All Terminals and Honors**: 1 fan

**Minimum fan to win**: 1 fan (Section 3.2)

---

## 2. Three Independent Payment Modes (Not Specified)

The specification does NOT explicitly define three separate payment modes. However, in real Hong Kong Mahjong, three distinct settlement scenarios exist:

### 2.1 Discard Win (Ron / 榮)
- Winner claims the discarded tile
- Only the **discarder** pays the winner
- Discarder pays based on their position (dealer or non-dealer)
- **Current spec covers this**: Full settlement where each loser pays

**Need clarification**: 
- In Discard mode, should ONLY the discarder pay?
- Or should all 3 losers contribute (current spec assumption)?

### 2.2 Self-Draw Win (Tsumo / 摸)
- Winner draws from wall to complete their hand
- All 3 other players must pay the winner
- Typically: Non-dealer wins by self-draw → each pays 1× fan
- Dealer wins by self-draw → each pays 2× fan (or variation)

**Current spec assumption**: "Should the self-draw win (Tsumo) receive a fan bonus?" (Section 3.3, Question 3)
- **Assumed NO bonus currently**
- But specification is **ambiguous** on whether self-draw vs. discard payment differs

### 2.3 Full Payment / Pao (包)
- A Kong or other special situation causes a "liability" player to pay for all losers
- OR: A player who drew a tile that led to another's win pays extra
- OR: When a Kong is declared and another player wins from the next draw

**Current spec**: DOES NOT mention Pao explicitly
- **Flagged as missing or out of scope**

---

## 3. Critical Ambiguities Requiring Confirmation

### ❓ Question 1: Discard Win Payment Model
**Current Spec (Section 3.8)**: "Each loser pays 1× fan value"

**Clarification Needed**:
```
Scenario: Player A (non-dealer) wins on Player B's discard

OPTION A (Current Spec - All Losers Pay):
  Player A (winner) receives:
    - From Player B (discarder): 1 × fan
    - From Player C (other): 1 × fan
    - From Player D (other): 1 × fan
    Total: 3 × fan

OPTION B (Typical HK Mahjong - Only Discarder Pays):
  Player A (winner) receives:
    - From Player B (discarder): 1 × fan × 3 (multiplied for 3 players)
    - From Player C: 0
    - From Player D: 0
    Total: 3 × fan
```

**Status**: Current spec assumes all losers pay equally. Clarify if this is correct.

---

### ❓ Question 2: Self-Draw vs. Discard Payment Difference
**Current Spec (Section 3.3, Q3)**: "Should the 'self-draw win' (Tsumo) receive a fan bonus? (Assumed NO in current spec, but varies by region.)"

**Clarification Needed**:
```
OPTION A (Same Payment for Both):
  Discard Win (2 fan): Each loser pays 2
  Self-Draw Win (2 fan): Each loser pays 2

OPTION B (Self-Draw Pays Less):
  Discard Win (2 fan): Each loser pays 2
  Self-Draw Win (2 fan): Each loser pays 1 (half payment)

OPTION C (Dealer Bonus on Self-Draw):
  Non-dealer self-draw: Each loser pays 1× fan
  Dealer self-draw: Each loser pays 2× fan (or 3× fan)
```

**Current Assumption**: All scenarios pay equally. Confirm if correct.

---

### ❓ Question 3: Kong Liability (Pao / 包)
**Current Spec**: Does NOT mention Kong liability payments

**Clarification Needed**:
```
When Player A declares or melds a Kong, and then Player B wins:

SCENARIO 1 (No Special Liability):
  Player B wins normally. Player A pays like any other loser.

SCENARIO 2 (Kong Liability):
  If another player wins from the tile following the Kong:
    - Player A (Kong declarant) must pay double or triple
    - OR: Player A pays for all players' contribution

SCENARIO 3 (Kong Discard Liability):
  If Player A's Kong discard is used by Player B to win:
    - Player A pays extra (like discarder), even if Kong was exposed
```

**Current Assumption**: No special Kong liability. Confirm if correct.

---

### ❓ Question 4: Dealer Payment Direction
**Current Spec (Section 3.4)**: 
- Dealer loses: "Dealer pays 2× fan to winner; non-dealers pay 1× fan value each"

**Clarification Needed**:
```
Is this the correct interpretation?

Example: Non-dealer P1 wins; Dealer loses

Current Assumption:
  P1 receives:
    - From Dealer: 2 × fan (double)
    - From P2: 1 × fan
    - From P3: 1 × fan
    Total: (2×) + 1 + 1 = 2×fan + 2 points

Variant Interpretation:
  P1 receives:
    - From Dealer: 1 × fan × 2 (double multiplier applied)
    - From P2: 1 × fan
    - From P3: 1 × fan
    Total: 2 + 1 + 1 = 4 points (for 1 fan)
```

**Status**: Assumption seems correct, but confirm the calculation method.

---

### ❓ Question 5: Maximum Payment Cap
**Current Spec**: Does NOT mention maximum payment limits

**Clarification Needed**:
```
Should there be a maximum payment per loser?

OPTION A (No Cap):
  A 8-fan hand = each loser pays 8 points (or 16 if dealer multiplier)

OPTION B (Cap at Configuration Max):
  Max fan = 5, so even if hand has 8 fan → calculated as 5 fan
  
OPTION C (Limit by Player Score):
  Loser cannot pay more than their current score
```

**Current Assumption**: No cap mentioned. Confirm.

---

## 4. Proposed Architecture

### 4.1 Payment Modes to Implement

Based on clarification needed, implement **three independent modes**:

```typescript
enum PaymentMode {
  DISCARD_WIN = "discard",           // Winner claims discarded tile
  SELF_DRAW_WIN = "self-draw",       // Winner draws from wall
  PAO_LIABILITY = "pao"              // Kong or special liability payment
}
```

### 4.2 Core Payment Calculator Structure

```typescript
// Core interfaces (backend/src/game/Settlement.ts)

interface WinnerInfo {
  position: Position;                // East, South, West, North
  isDealer: boolean;
  fanCount: number;
  paymentMode: PaymentMode;
  liabilityPlayer?: Position;        // For Pao mode
}

interface PaymentBreakdown {
  winner: Position;
  payments: {
    [playerId: string]: {
      payer: Position;
      amount: number;
      reason: string;                // "base" | "dealer_multiplier" | "discarder_bonus" etc.
    }
  };
  total: number;                     // Total amount winner receives
  details: {
    fan: number;
    baseRate: number;
    dealerMultiplier: number;
    total: number;
  }
}

interface SettlementCalculation {
  winner: WinnerInfo;
  payments: PaymentBreakdown;
  validation: {
    isValid: boolean;
    errors: string[];
  }
}
```

### 4.3 File Structure

**New files to create:**

```
backend/src/
├── game/
│   ├── Settlement.ts                # Payment calculation engine
│   ├── PaymentCalculator.ts         # Discard, Self-Draw, Pao calculations
│   └── PaymentModes.ts              # Enum and mode definitions
│
├── config/
│   └── PaymentConfig.ts             # Configurable payment settings
│
└── tests/
    └── payment/
        ├── Settlement.test.ts       # Unit tests for settlement calculation
        ├── DisCardWin.test.ts       # Tests for discard mode
        ├── SelfDrawWin.test.ts      # Tests for self-draw mode
        └── PaoLiability.test.ts     # Tests for Pao mode
```

### 4.4 Configuration (Extensible)

```typescript
// backend/src/config/PaymentConfig.ts

interface PaymentConfig {
  // Base rates
  nonDealerBaseRate: number;         // 1 point per fan
  dealerBaseRate: number;            // 1 point per fan (before multiplier)
  
  // Multipliers
  dealerWinsMultiplier: number;      // 2x (dealer receives)
  dealerLosesMultiplier: number;     // 2x (dealer pays)
  
  // Limits
  maxFanForCalculation: number;      // Cap at this many fan
  maxPaymentPerLoser: number;        // Cap payment amount (0 = unlimited)
  
  // Mode-specific rules
  paymentModes: {
    discard: {
      enabled: boolean;
      payerMultiplier: number;       // Multiplier for discarder vs others
      allLosersContribute: boolean;  // true = all pay, false = only discarder
    };
    selfDraw: {
      enabled: boolean;
      allMustPay: boolean;           // true = all 3 pay, false = only opponents
      reducedPayment: boolean;       // true = self-draw pays less
    };
    pao: {
      enabled: boolean;
      liabilityMultiplier: number;   // How much liable player pays extra
    };
  };
}
```

---

## 5. Implementation Plan

### Phase 1: Core Settlement Logic
1. Create `Settlement.ts` with base calculation engine
2. Implement full payment model (current spec assumption)
3. Write unit tests for base case

### Phase 2: Multiple Payment Modes
1. Create `PaymentCalculator.ts` with mode-specific logic
2. Implement Discard, Self-Draw, Pao modes
3. Add configuration support
4. Write comprehensive tests for each mode

### Phase 3: Validation & Error Handling
1. Add validation for payment amounts
2. Handle edge cases (player out of points, invalid fan, etc.)
3. Write integration tests

### Phase 4: Configuration Extension
1. Make payment rules configurable
2. Allow rules to be loaded from config file
3. Document configuration options

---

## 6. Flagged Ambiguities Summary

| # | Ambiguity | Specification Reference | Status | Impact |
|---|-----------|------------------------|--------|--------|
| 1 | Discard payment: only discarder or all losers? | Section 3.8 | ⚠️ NEEDS CONFIRMATION | HIGH - Affects payout calculation |
| 2 | Self-draw vs. discard payment difference? | Section 3.3, Q3 | ⚠️ NEEDS CONFIRMATION | MEDIUM - May affect fairness |
| 3 | Kong liability (Pao) rules? | Not specified | ⚠️ MISSING | MEDIUM - Common in HK Mahjong |
| 4 | Dealer payment calculation method? | Section 3.4 | ✅ ASSUMED CLEAR | LOW - Seems clear |
| 5 | Maximum payment cap? | Not specified | ⚠️ MISSING | LOW - Depends on scoring system |

---

## 7. Assumptions for Initial Implementation

**For the MVP, I will assume:**

1. ✅ **Full Settlement Model**: All 3 losers contribute equally to winner's payment
2. ✅ **No Self-Draw Bonus**: Self-draw and discard wins pay the same
3. ❌ **No Pao Liability**: Kong does not create special payment liability (can be added later)
4. ✅ **Dealer Multiplier Applied**: Dealer pays/receives 2× as specified
5. ✅ **No Payment Cap**: Payments scale with fan count (no maximum)
6. ✅ **Configuration Support**: Rules can be modified via PaymentConfig

**These assumptions will be documented in code comments and can be updated once clarification is received.**

---

## 8. Next Steps

### Before Implementation:
1. [ ] Confirm payment model (all losers contribute vs. only discarder)
2. [ ] Clarify self-draw vs. discard payment rules
3. [ ] Decide on Pao liability inclusion
4. [ ] Review calculation formulas

### During Implementation:
1. Create Settlement.ts with base calculation
2. Create PaymentCalculator.ts with mode-specific logic
3. Create comprehensive unit tests
4. Document all assumptions in code

### After Implementation:
1. Provide summary of created files
2. Show test results
3. Document any rule clarifications made
4. Provide usage examples

---

**Document Status**: Ready for confirmation on ambiguities  
**Target Implementation**: Immediately after confirmation
