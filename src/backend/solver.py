import kociemba
import random

def solve(cube_string):
    try:
        # Basic validation
        if not cube_string or len(cube_string) != 54:
            return "Invalid cube string. Must be 54 characters representing the cube state."
        
        # Validate cube has exactly 9 of each color
        valid_colors = {'U', 'D', 'L', 'R', 'F', 'B', 'W', 'Y', 'O', 'R', 'G', 'B'}
        color_count = {}
        
        for color in cube_string:
            if color not in valid_colors:
                return f"Invalid color '{color}' found in cube string."
            color_count[color] = color_count.get(color, 0) + 1
        
        # Check if we have exactly 9 of each of 6 colors
        if len(color_count) != 6:
            return f"Invalid cube: Found {len(color_count)} colors, expected 6."
        
        for color, count in color_count.items():
            if count != 9:
                return f"Invalid cube: Color '{color}' appears {count} times, expected 9."
        
        # Try to solve with Kociemba
        solution = kociemba.solve(cube_string)
        return solution if solution else "No solution found"
        
    except ValueError as e:
        return f"Invalid cube configuration: {e}"
    except Exception as e:
        return f"Solver error: {e}"

def generate_scramble():
    """Generate a random scramble sequence"""
    moves = ['R', 'L', 'U', 'D', 'F', 'B']
    modifiers = ['', "'", '2']
    
    scramble = []
    last_move = None
    
    for _ in range(20):  # Generate 20 moves
        move = random.choice(moves)
        # Avoid consecutive moves on the same face
        while move == last_move:
            move = random.choice(moves)
        
        modifier = random.choice(modifiers)
        scramble.append(move + modifier)
        last_move = move
    
    return ' '.join(scramble)
