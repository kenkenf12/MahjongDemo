#!/usr/bin/env python3
"""
Generate Mahjong tile images for the web frontend.
Creates stylized tile graphics using PIL.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Create directories
base_dir = Path("frontend/assets/tiles")
base_dir.mkdir(parents=True, exist_ok=True)

# Mahjong tile definitions
TILES = {
    # Character suits (1-9)
    'character': {
        1: ('character_1', '1'),
        2: ('character_2', '2'),
        3: ('character_3', '3'),
        4: ('character_4', '4'),
        5: ('character_5', '5'),
        6: ('character_6', '6'),
        7: ('character_7', '7'),
        8: ('character_8', '8'),
        9: ('character_9', '9'),
    },
    # Bamboo suits (1-9) - 1 shows a bird
    'bamboo': {
        1: ('bamboo_1', '鸟'),
        2: ('bamboo_2', '2'),
        3: ('bamboo_3', '3'),
        4: ('bamboo_4', '4'),
        5: ('bamboo_5', '5'),
        6: ('bamboo_6', '6'),
        7: ('bamboo_7', '7'),
        8: ('bamboo_8', '8'),
        9: ('bamboo_9', '9'),
    },
    # Dots (1-9)
    'dot': {
        1: ('dot_1', '●'),
        2: ('dot_2', '●●'),
        3: ('dot_3', '●●●'),
        4: ('dot_4', '●●●●'),
        5: ('dot_5', '●●●●●'),
        6: ('dot_6', '●●●●●●'),
        7: ('dot_7', '●●●●●●●'),
        8: ('dot_8', '●●●●●●●●'),
        9: ('dot_9', '●●●●●●●●●'),
    },
    # Winds
    'wind': {
        'east': ('wind_east', '東'),
        'south': ('wind_south', '南'),
        'west': ('wind_west', '西'),
        'north': ('wind_north', '北'),
    },
    # Dragons
    'dragon': {
        'red': ('dragon_red', '红'),
        'green': ('dragon_green', '绿'),
        'white': ('dragon_white', '白'),
    },
    # Honors
    'flower': {
        'plum': ('flower_plum', '梅'),
        'orchid': ('flower_orchid', '兰'),
        'bamboo': ('flower_bamboo', '竹'),
        'chrysanthemum': ('flower_chrysanthemum', '菊'),
    },
    'season': {
        'spring': ('season_spring', '春'),
        'summer': ('season_summer', '夏'),
        'autumn': ('season_autumn', '秋'),
        'winter': ('season_winter', '冬'),
    },
}

# Tile colors
TILE_COLORS = {
    'character': (240, 230, 200),  # Light tan
    'bamboo': (200, 220, 200),     # Light green
    'dot': (220, 200, 200),        # Light red
    'wind': (240, 240, 220),       # Light yellow
    'dragon': (200, 200, 220),     # Light blue
    'flower': (230, 200, 230),     # Light purple
    'season': (220, 240, 240),     # Light cyan
}

TEXT_COLORS = {
    'character': (50, 50, 50),
    'bamboo': (20, 100, 20),
    'dot': (150, 30, 30),
    'wind': (180, 150, 30),
    'dragon': (20, 50, 150),
    'flower': (150, 50, 150),
    'season': (30, 120, 150),
}

def create_tile_image(suit, rank_or_type, label, filename):
    """Create a Mahjong tile image using PIL."""
    
    # Tile dimensions
    width, height = 60, 80
    
    # Get colors
    bg_color = TILE_COLORS.get(suit, (240, 240, 240))
    text_color = TEXT_COLORS.get(suit, (0, 0, 0))
    
    # Create image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw border
    border_color = tuple(max(0, c - 50) for c in bg_color)
    draw.rectangle([0, 0, width-1, height-1], outline=border_color, width=2)
    
    # Draw inner rectangle
    draw.rectangle([3, 3, width-4, height-4], outline=border_color, width=1)
    
    # Try to use a default font, fallback to basic font
    try:
        # Try to load a better font
        font = ImageFont.truetype("arial.ttf", 20)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Draw label in center
    bbox = draw.textbbox((0, 0), label, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 5
    
    draw.text((x, y), label, fill=text_color, font=font)
    
    # Save image
    img.save(filename)
    print(f"Created: {filename}")

def generate_all_tiles():
    """Generate all Mahjong tile images."""
    
    for suit, values in TILES.items():
        for rank_or_type, (filename, label) in values.items():
            filepath = base_dir / f"{filename}.png"
            create_tile_image(suit, rank_or_type, label, str(filepath))
    
    # Also create a back/reverse image
    back_path = base_dir / "back.png"
    img = Image.new('RGB', (60, 80), (100, 100, 100))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 59, 79], outline=(50, 50, 50), width=2)
    draw.rectangle([3, 3, 56, 76], outline=(50, 50, 50), width=1)
    # Draw pattern
    for i in range(6):
        for j in range(8):
            draw.line([(10+i*5, 10+j*8), (15+i*5, 15+j*8)], fill=(150, 150, 150), width=1)
    img.save(back_path)
    print(f"Created: {back_path}")

if __name__ == '__main__':
    print("Generating Mahjong tile images...")
    generate_all_tiles()
    print("All tiles generated successfully!")
    print(f"Tiles saved to: {base_dir}")
