/**
 * Meld Model - Represents groups of tiles (melds) in a hand
 *
 * A meld is a group of tiles that forms a valid pattern:
 * - Chow (顺): 3 consecutive numbered tiles of same suit (e.g., 1m 2m 3m)
 * - Pong (碰): 3 identical tiles (triplet)
 * - Kong (杠): 4 identical tiles (quad)
 * - Concealed Kong (暗杠): Kong formed from hand (not from discard claim)
 */
/**
 * Types of melds
 */
export var MeldType;
(function (MeldType) {
    MeldType["CHOW"] = "chow";
    MeldType["PONG"] = "pong";
    MeldType["KONG"] = "kong";
    MeldType["CONCEALED_KONG"] = "concealed_kong";
})(MeldType || (MeldType = {}));
/**
 * Create a chow (sequence of 3)
 * @param tiles Must be 3 consecutive numbered tiles of same suit
 */
export function createChow(tiles) {
    if (tiles.length !== 3) {
        throw new Error('Chow must have exactly 3 tiles');
    }
    return {
        type: MeldType.CHOW,
        tiles: [...tiles],
        isConcealed: false
    };
}
/**
 * Create a pong (triplet)
 * @param tiles Must be 3 identical tiles
 */
export function createPong(tiles, isConcealed = false) {
    if (tiles.length !== 3) {
        throw new Error('Pong must have exactly 3 tiles');
    }
    return {
        type: MeldType.PONG,
        tiles: [...tiles],
        isConcealed
    };
}
/**
 * Create a kong (quad)
 * @param tiles Must be 4 identical tiles
 */
export function createKong(tiles, isConcealed = false) {
    if (tiles.length !== 4) {
        throw new Error('Kong must have exactly 4 tiles');
    }
    return {
        type: MeldType.KONG,
        tiles: [...tiles],
        isConcealed
    };
}
/**
 * Create a pair (winning hand must have exactly 1)
 * @param tiles Must be 2 identical tiles
 */
export function createPair(tiles) {
    if (tiles.length !== 2) {
        throw new Error('Pair must have exactly 2 tiles');
    }
    return {
        tiles: [tiles[0], tiles[1]]
    };
}
/**
 * Get fan value for a meld (before pattern bonuses)
 */
export function getMeldFanValue(meld, fanValues) {
    switch (meld.type) {
        case MeldType.PONG:
            // Pongs are worth 1 fan (same whether concealed or exposed in Hong Kong)
            return fanValues.PONG_EXPOSED || 1;
        case MeldType.KONG:
            // Kong worth 1 if exposed, 2 if concealed
            return meld.isConcealed ? (fanValues.KONG_CONCEALED || 2) : (fanValues.KONG_EXPOSED || 1);
        case MeldType.CHOW:
            // Chows are worth 0 fan (but required for hand structure)
            return 0;
        default:
            return 0;
    }
}
/**
 * Get total fan from bonus tiles (flowers and seasons)
 */
export function getBonusFanValue(flowers, seasons, fanValues) {
    const flowerFan = flowers.length * (fanValues.FLOWER || 1);
    const seasonFan = seasons.length * (fanValues.SEASON || 1);
    return flowerFan + seasonFan;
}
