/**
 * Tile Model - Core tile representation for Hong Kong Mahjong
 *
 * A standard set consists of 144 tiles:
 * - 36 Character tiles (1-9 of characters, 4 copies each)
 * - 36 Bamboo tiles (1-9 of bamboos, 4 copies each)
 * - 36 Dot tiles (1-9 of dots, 4 copies each)
 * - 16 Wind tiles (4 winds × 4 copies)
 * - 12 Dragon tiles (3 dragons × 4 copies)
 * - 8 Flower tiles (4 flowers × 2 copies) - optional play
 * - 8 Season tiles (4 seasons × 2 copies) - optional play
 */
/**
 * Tile suit enumeration
 */
export var TileSuit;
(function (TileSuit) {
    TileSuit["CHARACTER"] = "character";
    TileSuit["BAMBOO"] = "bamboo";
    TileSuit["DOT"] = "dot";
    TileSuit["WIND"] = "wind";
    TileSuit["DRAGON"] = "dragon";
    TileSuit["FLOWER"] = "flower";
    TileSuit["SEASON"] = "season"; // 季 (ji)
})(TileSuit || (TileSuit = {}));
/**
 * Wind directions
 */
export var WindType;
(function (WindType) {
    WindType["EAST"] = "east";
    WindType["SOUTH"] = "south";
    WindType["WEST"] = "west";
    WindType["NORTH"] = "north"; // 北 (bei)
})(WindType || (WindType = {}));
/**
 * Dragon types
 */
export var DragonType;
(function (DragonType) {
    DragonType["RED"] = "red";
    DragonType["GREEN"] = "green";
    DragonType["WHITE"] = "white"; // 白 (bai)
})(DragonType || (DragonType = {}));
/**
 * Flower and Season names
 */
export var FlowerType;
(function (FlowerType) {
    FlowerType["PLUM"] = "plum";
    FlowerType["ORCHID"] = "orchid";
    FlowerType["BAMBOO_F"] = "bamboo_f";
    FlowerType["CHRYSANTHEMUM"] = "chrysanthemum"; // 菊 (ju)
})(FlowerType || (FlowerType = {}));
export var SeasonType;
(function (SeasonType) {
    SeasonType["SPRING"] = "spring";
    SeasonType["SUMMER"] = "summer";
    SeasonType["AUTUMN"] = "autumn";
    SeasonType["WINTER"] = "winter"; // 冬 (dong)
})(SeasonType || (SeasonType = {}));
/**
 * Create a numbered suit tile (character, bamboo, or dot)
 *
 * @param suit The suit (CHARACTER, BAMBOO, or DOT)
 * @param rank The rank (1-9)
 * @param instance Unique identifier for this tile instance (1-4)
 * @returns Tile interface
 */
export function createNumberTile(suit, rank, instance) {
    if (rank < 1 || rank > 9) {
        throw new Error(`Invalid rank ${rank} for number tile. Must be 1-9.`);
    }
    if (instance < 1 || instance > 4) {
        throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
    }
    const suitNames = {
        [TileSuit.CHARACTER]: { name: '萬', abbr: 'm' },
        [TileSuit.BAMBOO]: { name: '索', abbr: 's' },
        [TileSuit.DOT]: { name: '筒', abbr: 'p' },
        [TileSuit.WIND]: { name: '', abbr: '' },
        [TileSuit.DRAGON]: { name: '', abbr: '' },
        [TileSuit.FLOWER]: { name: '', abbr: '' },
        [TileSuit.SEASON]: { name: '', abbr: '' }
    };
    const suitInfo = suitNames[suit];
    const displayName = `${rank}${suitInfo.abbr}`;
    const sortKey = getSortKey(suit, rank);
    return {
        id: `${suit}-${rank}-${instance}`,
        suit,
        rank,
        displayName,
        sortKey
    };
}
/**
 * Create a wind tile
 */
export function createWindTile(wind, instance) {
    if (instance < 1 || instance > 4) {
        throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
    }
    const windNames = {
        [WindType.EAST]: '東',
        [WindType.SOUTH]: '南',
        [WindType.WEST]: '西',
        [WindType.NORTH]: '北'
    };
    return {
        id: `wind-${wind}-${instance}`,
        suit: TileSuit.WIND,
        wind,
        displayName: windNames[wind],
        sortKey: getSortKey(TileSuit.WIND, 0, wind)
    };
}
/**
 * Create a dragon tile
 */
export function createDragonTile(dragon, instance) {
    if (instance < 1 || instance > 4) {
        throw new Error(`Invalid instance ${instance}. Must be 1-4.`);
    }
    const dragonNames = {
        [DragonType.RED]: '紅',
        [DragonType.GREEN]: '綠',
        [DragonType.WHITE]: '白'
    };
    return {
        id: `dragon-${dragon}-${instance}`,
        suit: TileSuit.DRAGON,
        dragon,
        displayName: dragonNames[dragon],
        sortKey: getSortKey(TileSuit.DRAGON, 0, undefined, dragon)
    };
}
/**
 * Create a flower tile (bonus tile, not part of hand)
 */
export function createFlowerTile(flower, instance) {
    if (instance < 1 || instance > 2) {
        throw new Error(`Invalid instance ${instance}. Flowers have 2 copies each.`);
    }
    const flowerNames = {
        [FlowerType.PLUM]: '梅',
        [FlowerType.ORCHID]: '蘭',
        [FlowerType.BAMBOO_F]: '竹',
        [FlowerType.CHRYSANTHEMUM]: '菊'
    };
    return {
        id: `flower-${flower}-${instance}`,
        suit: TileSuit.FLOWER,
        flower,
        displayName: flowerNames[flower],
        sortKey: 100 + Object.values(FlowerType).indexOf(flower) * 10 + instance
    };
}
/**
 * Create a season tile (bonus tile, not part of hand)
 */
export function createSeasonTile(season, instance) {
    if (instance < 1 || instance > 2) {
        throw new Error(`Invalid instance ${instance}. Seasons have 2 copies each.`);
    }
    const seasonNames = {
        [SeasonType.SPRING]: '春',
        [SeasonType.SUMMER]: '夏',
        [SeasonType.AUTUMN]: '秋',
        [SeasonType.WINTER]: '冬'
    };
    return {
        id: `season-${season}-${instance}`,
        suit: TileSuit.SEASON,
        season,
        displayName: seasonNames[season],
        sortKey: 150 + Object.values(SeasonType).indexOf(season) * 10 + instance
    };
}
/**
 * Generate sort key for tile ordering
 * Used to maintain consistent tile order in display
 */
function getSortKey(suit, rank = 0, wind, dragon) {
    const suitOrder = {
        [TileSuit.CHARACTER]: 0,
        [TileSuit.BAMBOO]: 10,
        [TileSuit.DOT]: 20,
        [TileSuit.WIND]: 30,
        [TileSuit.DRAGON]: 40,
        [TileSuit.FLOWER]: 100,
        [TileSuit.SEASON]: 150
    };
    let key = suitOrder[suit] + rank;
    if (wind !== undefined) {
        const windOrder = [WindType.EAST, WindType.SOUTH, WindType.WEST, WindType.NORTH];
        key = suitOrder[suit] + windOrder.indexOf(wind);
    }
    if (dragon !== undefined) {
        const dragonOrder = [DragonType.RED, DragonType.GREEN, DragonType.WHITE];
        key = suitOrder[suit] + dragonOrder.indexOf(dragon);
    }
    return key;
}
/**
 * Check if two tiles are the same type (ignoring instance)
 */
export function areSameTileType(tile1, tile2) {
    if (tile1.suit !== tile2.suit)
        return false;
    switch (tile1.suit) {
        case TileSuit.CHARACTER:
        case TileSuit.BAMBOO:
        case TileSuit.DOT:
            return tile1.rank === tile2.rank;
        case TileSuit.WIND:
            return tile1.wind === tile2.wind;
        case TileSuit.DRAGON:
            return tile1.dragon === tile2.dragon;
        case TileSuit.FLOWER:
            return tile1.flower === tile2.flower;
        case TileSuit.SEASON:
            return tile1.season === tile2.season;
        default:
            return false;
    }
}
/**
 * Get human-readable tile name for debugging/display
 */
export function getTileName(tile) {
    return tile.displayName;
}
/**
 * Check if tile is a terminal (1 or 9 in number suits)
 */
export function isTerminal(tile) {
    if (tile.suit === TileSuit.CHARACTER || tile.suit === TileSuit.BAMBOO || tile.suit === TileSuit.DOT) {
        return tile.rank === 1 || tile.rank === 9;
    }
    return false;
}
/**
 * Check if tile is an honor (wind or dragon)
 */
export function isHonor(tile) {
    return tile.suit === TileSuit.WIND || tile.suit === TileSuit.DRAGON;
}
/**
 * Check if tile is a terminal or honor
 */
export function isTerminalOrHonor(tile) {
    return isTerminal(tile) || isHonor(tile);
}
/**
 * Check if tile is a simple (2-8 in number suits)
 */
export function isSimple(tile) {
    if (tile.suit === TileSuit.CHARACTER || tile.suit === TileSuit.BAMBOO || tile.suit === TileSuit.DOT) {
        return tile.rank !== undefined && tile.rank >= 2 && tile.rank <= 8;
    }
    return false;
}
/**
 * Check if tile is a bonus tile (flower or season)
 */
export function isBonus(tile) {
    return tile.suit === TileSuit.FLOWER || tile.suit === TileSuit.SEASON;
}
/**
 * Check if tiles are consecutive in the same suit (for chow detection)
 */
export function areConsecutive(tile1, tile2, tile3) {
    if (tile1.suit !== tile2.suit ||
        tile2.suit !== tile3.suit ||
        !tile1.rank ||
        !tile2.rank ||
        !tile3.rank) {
        return false;
    }
    const ranks = [tile1.rank, tile2.rank, tile3.rank].sort((a, b) => a - b);
    return ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1;
}
