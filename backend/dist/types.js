/**
 * Core type definitions for the Mahjong payment calculator
 */
/**
 * Payment mode enumeration
 * - DISCARD: Winner claims another player's discarded tile
 * - SELF_DRAW: Winner draws from wall to complete hand
 * - FULL_PAYMENT: Special payment mode for Pao liability (separate liability player)
 */
export var PaymentMode;
(function (PaymentMode) {
    PaymentMode["DISCARD"] = "discard";
    PaymentMode["SELF_DRAW"] = "self_draw";
    PaymentMode["FULL_PAYMENT"] = "full_payment";
})(PaymentMode || (PaymentMode = {}));
/**
 * Default payment configuration (uses confirmed business rules)
 */
export const DEFAULT_PAYMENT_CONFIG = {
    baseRate: 1,
    maxFanForCalculation: 0, // 0 means no limit (Q4 cap is configurable)
    maxPaymentPerLoser: 0, // 0 means no per-loser cap
    paymentModes: {
        discard: {
            enabled: true,
            onlyDiscarderpays: true // CONFIRMED: Q1 - Only discarder pays
        },
        selfDraw: {
            enabled: true,
            allMustPay: true // CONFIRMED: Q2 - All 3 players pay
        },
        fullPayment: {
            enabled: true
        }
    }
};
