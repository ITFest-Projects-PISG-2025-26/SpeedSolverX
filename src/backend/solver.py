import kociemba
import random

def solve(cube_string):
    try:
        if not cube_string or len(cube_string) != 54:
            return "Invalid cube string. Must be 54 characters representing the cube state."
        return kociemba.solve(cube_string)
    except Exception as e:
        return f"Invalid input: {e}"

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
